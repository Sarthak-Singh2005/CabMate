import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket";

export default function Chat() {
  const { id } = useParams();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [owner, setOwner] = useState(false);
  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/messages/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setMessages(data.messages);
      setCurrentUser(data.currentUser);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const handleIncoming = (data) => {
      if (data?.type !== "new_message") return;
      const incoming = data?.newMessage;
      if (!incoming) return;
      if (String(incoming.conversationId) === id) {
        setMessages((prev) => [...prev, incoming]);
      }
    };

    socket.on("notification", handleIncoming);
    return () => socket.off("notification", handleIncoming);
  }, [id]);

  const sendMessage = async () => {
    try {
      if (text.trim() === "") {
        return;
      }
      const res = await fetch("http://localhost:5000/api/chat/send", {
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
      console.log(err);
    }
  };
  return (
    <div className="chat-page">
      <div className="chat-header">CabMate Chat</div>
      <div className="chat-box">
        {messages.map((msg) => {
          return (
            <div
              key={msg._id}
              className={
                msg.sender._id === currentUser ? "my-message" : "other-message"
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
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
