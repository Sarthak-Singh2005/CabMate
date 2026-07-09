import React, { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "../index.css";

export default function NotificationBell({
  notifications,
  unreadCount,
  onMarkAllRead,
  setNotifications,
  setUnreadCount,
}) {
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef(null);

  const navigate = useNavigate();

  const getEntityId = (entity) => {
    if (!entity) return "";
    return String(entity._id || entity);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleNotificationClick(notification) {
    try {
      if (!notification.isRead && notification._id) {
        const res = await fetch(
          `${API_BASE_URL}/api/notifications/${notification._id}/read`,
          {
            method: "PATCH",
            credentials: "include",
          },
        );

        if (res.ok) {
          setNotifications((prev) =>
            prev.map((n) =>
              n._id === notification._id ? { ...n, isRead: true } : n,
            ),
          );

          setUnreadCount((prev) => Math.max(prev - 1, 0));
        }
      }

      const rideId = getEntityId(notification.ride);
      const passengerId = getEntityId(notification.passenger);

      switch (notification.type) {
        case "booking_request":
          if (rideId) {
            navigate(`/ownerchats/${rideId}`, {
              state: passengerId
                ? { highlightChatSourceId: passengerId }
                : undefined,
            });
          }
          break;

        case "booking_accepted":
          navigate("/joinedrides", {
            state: {
              activeTab: "upcoming",
              highlightChatSourceId: rideId,
            },
          });
          break;

        case "booking_rejected":
          navigate("/rides", {
            state: {
              highlightChatSourceId: rideId,
            },
          });
          break;

        case "cancelled_ride":
        case "cancel_ride":
          navigate("/joinedrides", {
            state: {
              activeTab: "cancelled",
              highlightChatSourceId: rideId,
            },
          });
          break;

        case "new_message":
          if (notification.conversation) {
            navigate(`/chat/${getEntityId(notification.conversation)}`, {
              state: {
                highlightLatestMessage: true,
              },
            });
          }
          break;

        default:
          break;
      }

      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="notification-bell-wrapper" ref={wrapperRef}>
      <button
        className="notification-bell-button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <FaBell size={24} />

        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <span>Notifications</span>

            <button className="notification-mark-all" onClick={onMarkAllRead}>
              Mark all read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="notification-empty">No notifications yet.</div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification._id || Math.random()}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    cursor: "pointer",
                  }}
                  className={`notification-item ${
                    notification.isRead ? "read" : "unread"
                  }`}
                >
                  <div className="notification-item-type">
                    {notification.type.replaceAll("_", " ")}
                  </div>

                  <div className="notification-item-message">
                    {notification.message}
                  </div>

                  <div className="notification-item-time">
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString()
                      : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
