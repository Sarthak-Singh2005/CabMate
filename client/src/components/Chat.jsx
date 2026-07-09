import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket";

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState("");
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/messages/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setMessages(data.messages);
      setCurrentUser(data.currentUser);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const handleIncoming = (message) => {
      if (String(message.conversationId) !== id) return;

      setMessages((prev) => [...prev, message]);
    };

    socket.on("chat:message", handleIncoming);
    return () => socket.off("chat:message", handleIncoming);
  }, [id]);

  useEffect(() => {
    if (
      !location.state?.highlightLatestMessage ||
      !messages.length ||
      !currentUser
    ) {
      return;
    }

    const targetMessage =
      [...messages]
        .reverse()
        .find((message) => message.sender?._id !== currentUser) ||
      messages[messages.length - 1];

    if (!targetMessage?._id) return;

    setHighlightedMessageId(targetMessage._id);

    const scrollTimer = setTimeout(() => {
      document
        .getElementById(`message-${targetMessage._id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    const clearTimer = setTimeout(() => {
      setHighlightedMessageId("");
    }, 4000);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [location.state?.highlightLatestMessage, messages, currentUser]);

  const sendMessage = async () => {
    try {
      setLoading(true);
      if (text.trim() === "") {
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: id,
          text,
        }),
        credentials: "include",
      });
      const data = await res.json();
      setMessages((prev) => [...prev, data.newMessage]);
      setText("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const chatSource = location.state?.chatSource;

    if (chatSource?.pathname) {
      navigate(
        `${chatSource.pathname}${chatSource.search || ""}${chatSource.hash || ""}`,
        {
          state: {
            ...chatSource.returnState,
            highlightChatSourceId: chatSource.highlightId,
            highlightChatSourceType: chatSource.highlightType,
            activeTab: chatSource.activeTab,
          },
        },
      );
      return;
    }

    navigate(-1);
  };

  return (
    <div className="chat-page">
      <div className="chat-top">
        <button className="btnform" onClick={handleBack}>
          Back
        </button>
        <h1 className="chat-header">CabMate Chat</h1>
        <p>
          (These conversations are private and can only be seen and accessed by
          you and the other participant.)
        </p>
      </div>
      <div className="chat-box">
        {messages.map((msg) => {
          return (
            <div
              key={msg._id}
              id={`message-${msg._id}`}
              className={
                `${msg.sender._id === currentUser ? "my-message" : "other-message"} ${
                  highlightedMessageId === msg._id
                    ? "message-notification-highlight"
                    : ""
                }`
              }
            >
              <p>{msg.text}</p>
              <small>
                {msg.sender._id === currentUser ? "- You" : msg.sender.name}
              </small>
            </div>
          );
        })}
      </div>
      <div className="chat-input-section">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
        />
        <button disabled={loading} onClick={sendMessage}>
          {loading ? "Sending...." : "Send"}
        </button>
      </div>
    </div>
  );
}
