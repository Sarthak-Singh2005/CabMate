import { useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Account from "./components/Account";
import Rides from "./components/Rides";
import Createride from "./components/Createride";
import Chat from "./components/Chat";
import OwnerChats from "./components/OwnerChats";
import ProtectedRoute from "./components/ProtectedRoute";
import NotificationBell from "./components/NotificationBell";
import { Toaster } from "react-hot-toast";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useNotifications } from "./hooks/useNotifications";
import { HiOutlineUserCircle } from "react-icons/hi2";
import Profile from "./components/Profile";
import JoinedRides from "./components/JoinedRides";
import Owneravail from "./components/Owneravail";
import NotFound from "./components/NotFound";
import { MdOutlineDirectionsCar } from "react-icons/md";
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

  return (
    <div>
      <Toaster
        toastOptions={{
          duration: 1000,
          success: {
            duration: 1000,
          },
          error: {
            duration: 1000,
          },
        }}
      />

      {shouldShowNav && (
        <header className="app-header">
          <div className="nav-brand-row">
            <Link to="/rides" className="nav-brand">
              <MdOutlineDirectionsCar className="nav-brand-icon" />
              <span>CabMate</span>
            </Link>
          </div>

          <nav
            className={`nav-links ${mobileMenuOpen ? "nav-links-open" : ""}`}
          >
            <NavLink
              to="/rides"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              Find Rides
            </NavLink>
            <NavLink
              to="/createride"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              Post New Ride
            </NavLink>
            <NavLink
              to="/ownerride"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              My Rides
            </NavLink>
            <NavLink
              to="/joinedrides"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
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
        <Route path="/" element={<Account />} />

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
              <Chat />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
