import React, { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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
          `http://localhost:5000/api/notifications/${notification._id}/read`,
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

      // Navigate to the correct page depending on notification type.
      switch (notification.type) {
        case "booking_request":
          if (notification.ride) {
            navigate(`/ownerchats/${notification.ride}`);
          }
          break;

        case "booking_accepted":
          navigate("/rides");
          break;

        case "booking_rejected":
          navigate("/rides");
          break;

        case "new_message":
          if (notification.conversation) {
            navigate(`/chat/${notification.conversation}`);
          }
          break;

        default:
          break;
      }

      // Close the notification dropdown after the user clicks one.
      setOpen(false);
    } catch (err) {
      console.log(err);
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
