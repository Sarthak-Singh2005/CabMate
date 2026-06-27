import React, { useState } from "react";
import { FaBell } from "react-icons/fa";
import "../index.css";

export default function NotificationBell({
  notifications,
  unreadCount,
  onMarkAllRead,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="notification-bell-wrapper">
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
            notifications.map((notification) => (
              <div
                key={notification._id}
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
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
