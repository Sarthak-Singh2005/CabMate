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
  const [bookingStatusMap, setBookingStatusMap] = useState({}); // userId -> "pending" | "accepted" | "rejected"
  const [bookingRequestUsers, setBookingRequestUsers] = useState([]);
  const [loadingId, setLoadingId] = useState(null); // passengerId currently being accepted/rejected
  const [highlightedPassengerId, setHighlightedPassengerId] = useState("");

  const handleBack = () => {
    const rideSource = location.state?.rideSource;
    const sourceRideId = rideSource?.highlightId || rideId;

    if (rideSource?.pathname) {
      navigate(
        `${rideSource.pathname}${rideSource.search || ""}${rideSource.hash || ""}`,
        {
          state: {
            highlightChatSourceId: rideSource.highlightId,
            activeTab: rideSource.activeTab,
          },
        },
      );
      return;
    }

    navigate("/ownerride", {
      state: {
        highlightChatSourceId: sourceRideId,
      },
    });
  };

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
        const statusMap = {};
        data.bookingRequests.forEach((r) => {
          const uid = (r.user?._id || r.user).toString();
          statusMap[uid] = r.status;
        });
        setBookingStatusMap(statusMap);

        const users = data.bookingRequests.map((r) => {
          const user = r.user;
          if (typeof user === "string")
            return { _id: user, name: "Unknown User" };
          return {
            _id: user._id || user.id,
            name: user.name || user.phone || "Unknown User",
            gender: user.gender,
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
      setLoadingId(passengerId);
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
        setBookingStatusMap((prev) => ({ ...prev, [passengerId]: "accepted" }));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };
  const rejectBooking = async (passengerId) => {
    try {
      setLoadingId(passengerId);
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
        setBookingStatusMap((prev) => ({ ...prev, [passengerId]: "rejected" }));
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
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
              returnState: {
                rideSource: location.state?.rideSource,
              },
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
              returnState: {
                rideSource: location.state?.rideSource,
              },
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
      <div className="chat-top">
        <button type="button" className="btnform" onClick={handleBack}>
          Back
        </button>
        <h1 className="OwnMessHead chat-header">People Who Contacted You</h1>
      </div>
      {message && <h2 className="OwnMessHead">{message}</h2>}
      {(() => {
        const passengerMap = new Map();

        // Build a gender lookup from booking requests (conversation participants aren't populated with gender)
        const genderMap = {};
        bookingRequestUsers.forEach((u) => {
          const id = (u._id || u).toString();
          if (u.gender) genderMap[id] = u.gender;
        });

        conversations.forEach((conversation) => {
          const passenger = conversation.participants.find(
            (p) => p._id && p._id.toString() !== ownerId.toString(),
          );
          if (passenger) {
            const id = passenger._id.toString();
            passengerMap.set(id, {
              _id: id,
              name: passenger.name,
              gender: genderMap[id],
              conversationId: conversation._id,
            });
          }
        });

        bookingRequestUsers.forEach((u) => {
          const id = (u._id || u).toString();
          if (!passengerMap.has(id)) {
            passengerMap.set(id, {
              _id: id,
              name: u.name || "Unknown User",
              gender: u.gender,
            });
          } else {
            const existing = passengerMap.get(id);
            if (!existing.gender && u.gender) {
              passengerMap.set(id, { ...existing, gender: u.gender });
            }
          }
        });

        const combined = Array.from(passengerMap.values());
        return combined.map((passenger) => {
          const status = bookingStatusMap[passenger._id.toString()];
          const isLoading = loadingId === passenger._id;

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
                <h2>({passenger?.gender || "N/A"})</h2>
                <button
                  className="createbutton"
                  onClick={() => openConversation(passenger)}
                >
                  Click to open conversation
                </button>
              </div>

              {status === "pending" && (
                <div className="acceptbtn">
                  <h2>{passenger?.name} requested to join in cab</h2>
                  <button
                    className="createbutton"
                    disabled={isLoading}
                    onClick={() => acceptBooking(passenger._id)}
                  >
                    {isLoading ? "Loading...." : "Accept"}
                  </button>
                  <button
                    className="createbutton"
                    disabled={isLoading}
                    onClick={() => rejectBooking(passenger._id)}
                  >
                    {isLoading ? "Loading...." : "Reject"}
                  </button>
                </div>
              )}

              {status === "accepted" && (
                <div className="acceptbtn">
                  <span className="status-pill accepted">✅ Accepted</span>
                </div>
              )}

              {status === "rejected" && (
                <div className="acceptbtn">
                  <span className="status-pill rejected">❌ Rejected</span>
                </div>
              )}
            </div>
          );
        });
      })()}
    </div>
  );
}
