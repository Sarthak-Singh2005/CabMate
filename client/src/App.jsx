import React, { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Home from "./components/Home";
import Rides from "./components/Rides";
import Createride from "./components/Createride";
import Chat1 from "./components/Chat";
import OwnerChats from "./components/OwnerChats";

import NotificationBell from "./components/NotificationBell";
import ForgotPassword from "./components/ForgotPassword";
import { Toaster } from "react-hot-toast";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useNotifications } from "./hooks/useNotifications";
import { HiOutlineUserCircle } from "react-icons/hi2";
import Profile from "./components/Profile";
import JoinedRides from "./components/JoinedRides";
import Owneravail from "./components/Owneravail";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAllRead,
    setNotifications,
    setUnreadCount,
  } = useNotifications(userId);

  const shouldShowNav = Boolean(userId) && location.pathname !== "/";
  const shouldShowProfileIcon = shouldShowNav;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div>
      <Toaster />

      {shouldShowNav && (
        <header className="app-header">
          <div className="nav-brand-row">
            <Link
              to="/rides"
              className="nav-brand"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-brand-icon">🛻</span>
              <span>CabMate</span>
            </Link>
          </div>

          <nav
            className={`nav-links ${mobileMenuOpen ? "nav-links-open" : ""}`}
          >
            <NavLink
              to="/rides"
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/createride"
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Post New Ride
            </NavLink>
            <NavLink
              to="/ownerride"
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Posted Rides
            </NavLink>
            <NavLink
              to="/joinedrides"
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Joined Rides
            </NavLink>
          </nav>

          <div className="header-actions">
            <button
              className="mobile-nav-toggle"
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>

            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={markAllRead}
              setNotifications={setNotifications}
              setUnreadCount={setUnreadCount}
            />

            {shouldShowProfileIcon && (
              <button
                className="profile-icon-button"
                onClick={() => navigate(`/profile/${userId}`)}
                aria-label="Go to profile"
              >
                <HiOutlineUserCircle size={24} />
              </button>
            )}
          </div>
        </header>
      )}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/rides" element={<Rides />} />

        <Route path="/createride" element={<Createride />} />

        <Route path="/:id1/edit" element={<Createride />} />

        <Route path="/chat/:id" element={<Chat1 />} />

        <Route path="/ownerchats/:rideId" element={<OwnerChats />} />
        <Route path="/ownerride" element={<Owneravail />} />
        <Route path="/joinedrides" element={<JoinedRides />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile/:profileId" element={<Profile />} />
      </Routes>
    </div>
  );
}
