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
import { Toaster } from "react-hot-toast";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useNotifications } from "./hooks/useNotifications";
import { HiOutlineUserCircle } from "react-icons/hi2";
import NotificationBell from "./components/NotificationBell";
import Profile from "./components/Profile";
import JoinedRides from "./components/JoinedRides";
import Owneravail from "./components/Owneravail";
import NotFound from "./components/NotFound";
import { MdOutlineDirectionsCar } from "react-icons/md";
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";
export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationBellOpen, setNotificationBellOpen] = useState(false);
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

          <button
  className="mobile-nav-toggle"
  type="button"
  onClick={() => setMobileMenuOpen((open) => !open)}
  aria-label="Toggle navigation"
>
  {mobileMenuOpen ? (
    <HiOutlineXMark size={30} />
  ) : (
    <HiOutlineBars3 size={30} />
  )}
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
