import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Home from "./components/Home";
import Rides from "./components/Rides";
import Createride from "./components/Createride";
import Chat1 from "./components/Chat1";
import OwnerChats from "./components/OwnerChats";
import NotificationBell from "./components/NotificationBell";
import { Toaster } from "react-hot-toast";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useNotifications } from "./hooks/useNotifications";

export default function App() {
  const location = useLocation();
  const userId = useCurrentUser();

  const { notifications, unreadCount, markAllRead } = useNotifications(userId);

  const shouldShowNotificationBell =
    Boolean(userId) && location.pathname !== "/";

  return (
    <div>
      <Toaster />

      {shouldShowNotificationBell && (
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/rides" element={<Rides />} />

        <Route path="/createride" element={<Createride />} />

        <Route path="/:id1/edit" element={<Createride />} />

        <Route path="/chat/:id" element={<Chat1 />} />

        <Route path="/ownerchats/:rideId" element={<OwnerChats />} />
      </Routes>
    </div>
  );
}
