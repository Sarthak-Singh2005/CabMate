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
import ProtectedRoute from "./components/ProtectedRoute";
import NotificationBell from "./components/NotificationBell";
import ForgotPassword from "./components/ForgotPassword";
import { Toaster } from "react-hot-toast";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useNotifications } from "./hooks/useNotifications";
import { HiOutlineUserCircle } from "react-icons/hi2";
import Profile from "./components/Profile";
import JoinedRides from "./components/JoinedRides";
import Owneravail from "./components/Owneravail";
import NotFound from "./components/NotFound";


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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div>
      <Toaster
        toastOptions={{
          duration: 5000,
          success: {
            duration: 5000,
          },
          error: {
            duration: 5000,
          },
        }}
      />

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

            {shouldShowNav && (
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

        <Route
          path="/rides"
          element={
            <ProtectedRoute>
              <Rides />
            </ProtectedRoute>
          }
        />
        <Route
          path="/createride"
          element={
            <ProtectedRoute>
              <Createride />
            </ProtectedRoute>
          }
        />

        <Route
          path="/:id1/edit"
          element={
            <ProtectedRoute>
              <Createride />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <Chat1 />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ownerchats/:rideId"
          element={
            <ProtectedRoute>
              <OwnerChats />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ownerride"
          element={
            <ProtectedRoute>
              <Owneravail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/joinedrides"
          element={
            <ProtectedRoute>
              <JoinedRides />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:profileId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
