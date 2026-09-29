import { useCallback, useEffect, useState } from "react";
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
  const [rideGroup, setRideGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(false);
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);

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

  const fetchChats = useCallback(async () => {
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
  }, [rideId]);

  const fetchRideGroup = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/group/${rideId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setRideGroup(data.conversation);
    } catch (err) {
      console.error(err);
    }
  }, [rideId]);

  const openGroupChat = (conversation) => {
    navigate(`/chat/${conversation._id}`, {
      state: {
        chatSource: {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
          isRideGroup: true,
          returnState: { rideSource: location.state?.rideSource },
        },
      },
    });
  };

  const openGroupCreator = () => {
    const acceptedPassengerIds = bookingRequestUsers
      .filter((user) => bookingStatusMap[user._id] === "accepted")
      .map((user) => user._id);
    if (!acceptedPassengerIds.length) {
      return toast.error("Accept at least one passenger before creating a group");
    }
    setSelectedGroupMembers(acceptedPassengerIds);
    setGroupName("");
    setShowGroupCreator(true);
  };

  const toggleGroupMember = (passengerId) => {
    setSelectedGroupMembers((members) =>
      members.includes(passengerId)
        ? members.filter((id) => id !== passengerId)
        : [...members, passengerId],
    );
  };

  const createRideGroup = async () => {
    try {
      setGroupLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/chat/group/${rideId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, passengerIds: selectedGroupMembers }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Unable to create group");
      setRideGroup(data.conversation);
      setShowGroupCreator(false);
      toast.success("Ride group is ready");
      openGroupChat(data.conversation);
    } catch (err) {
      console.error(err);
      toast.error("Unable to create group");
    } finally {
      setGroupLoading(false);
    }
  };

  const fetchBookingRequests = useCallback(async () => {
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
  }, [rideId]);

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
          passengerId: passenger._id,
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
    const fetchTimer = setTimeout(() => {
      fetchChats();
    }, 0);

    return () => clearTimeout(fetchTimer);
  }, [fetchChats]);
  useEffect(() => {
    const fetchTimer = setTimeout(() => {
      fetchBookingRequests();
    }, 0);

    return () => clearTimeout(fetchTimer);
  }, [fetchBookingRequests]);
  useEffect(() => {
    const fetchTimer = setTimeout(fetchRideGroup, 0);
    return () => clearTimeout(fetchTimer);
  }, [fetchRideGroup]);

  useEffect(() => {
    const highlightId = location.state?.highlightChatSourceId;

    if (!highlightId) return;

    const scrollTimer = setTimeout(() => {
      setHighlightedPassengerId(highlightId);
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
      <div className="ride-group-actions">
        <button
          className="createbutton"
          disabled={groupLoading}
          onClick={() =>
            rideGroup ? openGroupChat(rideGroup) : openGroupCreator()
          }
        >
          {groupLoading
            ? "Creating group..."
            : rideGroup
              ? "Open Ride Group"
              : "Create Ride Group"}
        </button>
        {!rideGroup && (
          <p>Choose accepted passengers and give the group a name.</p>
        )}
      </div>
      {showGroupCreator && (
        <div className="popup" onClick={() => setShowGroupCreator(false)}>
          <div
            className="popup-container group-creator"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Create ride group</h2>
            <p>Choose who should be in this group.</p>
            <label htmlFor="group-name">Group name</label>
            <input
              id="group-name"
              value={groupName}
              maxLength={80}
              placeholder="e.g. Airport ride group"
              onChange={(event) => setGroupName(event.target.value)}
              autoFocus
            />
            <div className="group-member-list">
              {bookingRequestUsers
                .filter((user) => bookingStatusMap[user._id] === "accepted")
                .map((user) => (
                  <label className="group-member-option" key={user._id}>
                    <input
                      type="checkbox"
                      checked={selectedGroupMembers.includes(user._id)}
                      onChange={() => toggleGroupMember(user._id)}
                    />
                    <span>{user.name}</span>
                  </label>
                ))}
            </div>
            <div className="popup-buttons">
              <button
                className="popup-btn cancel-btn"
                onClick={() => setShowGroupCreator(false)}
              >
                Cancel
              </button>
              <button
                className="popup-btn confirm-btn"
                disabled={groupLoading}
                onClick={createRideGroup}
              >
                {groupLoading ? "Creating..." : "Create group"}
              </button>
            </div>
          </div>
        </div>
      )}
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
