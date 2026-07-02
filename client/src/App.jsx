import React from "react";
import { Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";

import Home from "./components/Home";
import Rides from "./components/Rides";
import Createride from "./components/Createride";
import Chat1 from "./components/Chat1";
import OwnerChats from "./components/OwnerChats";

import NotificationBell from "./components/NotificationBell";
import { Toaster } from "react-hot-toast";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useNotifications } from "./hooks/useNotifications";
import { HiOutlineUserCircle } from "react-icons/hi2";
import Profile from "./components/Profile";
import Owneravail from "./components/Owneravail";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = useCurrentUser();
  const {
    notifications,
    unreadCount,
    markAllRead,
    setNotifications,
    setUnreadCount,
  } = useNotifications(userId);

  const shouldShowNotificationBell =
    Boolean(userId) && location.pathname !== "/";

  return (
    <div>
      <Toaster />

      <div className="header-actions">
        {shouldShowNotificationBell && (
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={markAllRead}
            setNotifications={setNotifications}
            setUnreadCount={setUnreadCount}
          />
        )}

        <button
          className="profile-icon-button"
          onClick={() => navigate(`/profile/${userId}`)}
          aria-label="Go to profile"
        >
          <HiOutlineUserCircle size={24} />
        </button>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/rides" element={<Rides />} />

        <Route path="/createride" element={<Createride />} />

        <Route path="/:id1/edit" element={<Createride />} />

        <Route path="/chat/:id" element={<Chat1 />} />


        <Route path="/ownerchats/:rideId" element={<OwnerChats />} />
        <Route path="/ownerride" element={<Owneravail />} />

        <Route path="/profile/:profileId" element={<Profile />} />
      </Routes>
    </div>
  );
}
