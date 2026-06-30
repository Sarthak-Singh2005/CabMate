import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { socket } from "../socket";

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/notifications", {
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setNotifications(data.notifications);

          setUnreadCount(
            data.notifications.filter((notification) => !notification.isRead)
              .length,
          );
        } else if (res.status === 401) {
          localStorage.removeItem("userId");

          window.dispatchEvent(new Event("cabmate-auth-change"));
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    if (!userId) {
      socket.disconnect();

      setNotifications([]);

      setUnreadCount(0);

      return;
    }

    socket.disconnect();

    socket.connect();

    fetchNotifications();
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const handleNotification = (notification) => {
      if (!notification || !notification.type) {
        return;
      }

      const pushNotification = notification;

      setNotifications((prev) => [pushNotification, ...prev]);

      setUnreadCount((prev) => prev + 1);

      const handlers = {
        booking_request: () => {
          toast.success(
            notification.message || "New booking request received.",
          );
        },

        booking_accepted: () => {
          toast.success(
            notification.message || "Your booking request was accepted.",
          );
        },

        booking_rejected: () => {
          toast.error(
            notification.message || "Your booking request was rejected.",
          );
        },

        new_message: () => {
          toast(notification.message || "You have a new message.");
        },
        cancel_ride: ()=>{
          toast(notification.message);
        },
      };

      const handler = handlers[notification.type];

      if (handler) {
        handler();
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [userId]);

  const markAllRead = async () => {
    if (!userId) {
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/notifications/mark-all-read",
        {
          method: "PATCH",

          credentials: "include",
        },
      );

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,

            isRead: true,
          })),
        );

        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  return {
    notifications,

    unreadCount,

    markAllRead,

    setNotifications,

    setUnreadCount,
  };
}
