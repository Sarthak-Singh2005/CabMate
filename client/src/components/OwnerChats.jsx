import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { API_BASE_URL } from "../config/api";
import toast from "react-hot-toast";
export default function OwnerChats() {
  const { rideId } = useParams();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [ownerId, setOwnerId] = useState("");
  const [pendingPassengers, setPendingPassengers] = useState([]);
  const [bookingRequestUsers, setBookingRequestUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlightedPassengerId, setHighlightedPassengerId] = useState("");

  const fetchChats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/ride/${rideId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      const convs = Array.isArray(data.conversations) ? data.conversations : [];
      if (res.ok) {
        setConversations(convs);
        if (data.ownerId) setOwnerId(data.ownerId);
        if (convs.length === 0 && data.message) setMessage(data.message);
      } else {
        setMessage(data.message || "Unable to fetch conversations");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/rides/bookingrequests/${rideId}`,
        { method: "GET", credentials: "include" },
      );
      const data = await res.json();
      if (res.ok && Array.isArray(data.bookingRequests)) {
        const pending = data.bookingRequests
          .filter((r) => r.status === "pending")
          .map((r) => r.user._id);
        setPendingPassengers(pending.map((id) => id && id.toString()));

        const users = data.bookingRequests.map((r) => {
          const user = r.user;
          if (typeof user === "string")
            return { _id: user, name: "Unknown User" };
          return {
            _id: user._id || user.id,
            name: user.name || user.email || "Unknown User",
          };
        });
        setBookingRequestUsers(users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const acceptBooking = async (passengerId) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/rides/bookingconfirm/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rideId, passengerId }),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (res.ok) {
        setPendingPassengers((prev) => prev.filter((id) => id !== passengerId));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const rejectBooking = async (passengerId) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/rides/bookingconfirm/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rideId, passengerId }),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (res.ok) {
        setPendingPassengers((prev) => prev.filter((id) => id !== passengerId));
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const openConversation = async (passenger) => {
    try {
      if (passenger.conversationId) {
        navigate(`/chat/${passenger.conversationId}`, {
          state: {
            chatSource: {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
              highlightId: passenger._id,
              highlightType: "owner-passenger",
            },
          },
        });
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/chat/conversation`, {
        method: "POST",
        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          rideId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate(`/chat/${data.conversation._id}`, {
          state: {
            chatSource: {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
              highlightId: passenger._id,
              highlightType: "owner-passenger",
            },
          },
        });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [rideId]);
  useEffect(() => {
    fetchBookingRequests();
  }, [rideId]);

  useEffect(() => {
    const highlightId = location.state?.highlightChatSourceId;

    if (!highlightId) return;

    setHighlightedPassengerId(highlightId);

    const scrollTimer = setTimeout(() => {
      document
        .getElementById(`chat-source-${highlightId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    const clearTimer = setTimeout(() => {
      setHighlightedPassengerId("");
    }, 4000);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [
    location.state?.highlightChatSourceId,
    conversations.length,
    bookingRequestUsers.length,
  ]);

  return (
    <div className="owner-chat-page">
      <h1 className="OwnMessHead">People Who Contacted You</h1>
      {message && <h2 className="OwnMessHead">{message}</h2>}
      {(() => {
        const passengerMap = new Map();

        conversations.forEach((conversation) => {
          const passenger = conversation.participants.find(
            (p) => p._id && p._id.toString() !== ownerId.toString(),
          );
          if (passenger) {
            const id = passenger._id.toString();
            passengerMap.set(id, {
              _id: id,
              name: passenger.name,
              conversationId: conversation._id,
            });
          }
        });

        bookingRequestUsers.forEach((u) => {
          const id = (u._id || u).toString();
          if (!passengerMap.has(id)) {
            passengerMap.set(id, { _id: id, name: u.name || "Unknown User" });
          }
        });

        const combined = Array.from(passengerMap.values());
        return combined.map((passenger) => {
          return (
            <div
              key={passenger._id}
              id={`chat-source-${passenger._id}`}
              className={`chat-user-card ${
                highlightedPassengerId === passenger._id
                  ? "chat-source-highlight"
                  : ""
              }`}
            >
              <div className="avatar">
                {passenger?.name?.charAt(0)?.toUpperCase()}
              </div>

              <div className="chat-info">
                <h2>{passenger?.name}</h2>
                <button
                  className="createbutton"
                  onClick={() => openConversation(passenger)}
                >
                  Click to open conversation
                </button>
              </div>

              {pendingPassengers.includes(passenger._id.toString()) && (
                <div className="acceptbtn">
                  <h2>{passenger?.name} requested to join in cab</h2>
                  <button
                    className="createbutton"
                    onClick={() => acceptBooking(passenger._id)}
                  >
                    {loading ? "Accepting...." : "Accept"}
                  </button>
                  <button
                    className="createbutton"
                    onClick={() => rejectBooking(passenger._id)}
                  >
                    {loading ? "Rejecting...." : "Reject"}
                  </button>
                </div>
              )}
            </div>
          );
        });
      })()}
    </div>
  );
}
