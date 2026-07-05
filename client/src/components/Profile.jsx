import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../config/api";
export default function Profile() {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [showJoinedRides, setShowJoinedRides] = useState(false);
  const [joinedRides, setJoinedRides] = useState([]);
  const [joinedRidesLoading, setJoinedRidesLoading] = useState(false);

  const { profileId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/api/profile/${profileId}`,

          {
            method: "GET",
            credentials: "include",
          },
        );

        const response = await res.json();

        if (!res.ok) {
          throw new Error(response.message || "Failed to load profile");
        }

        setDetail(response.user || response);
      } catch (err) {
        console.error(err);
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);
  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleTogglePasswordForm = () => {
    setShowPasswordForm((prev) => !prev);
    setPasswordMessage("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/change-password`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        },
      );

      const response = await res.json();
      if (res.ok) {
        setPasswordMessage(
          response.message || "Password updated successfully.",
        );
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
      } else {
        setPasswordMessage(response.message || "Unable to update password.");
      }
    } catch (err) {
      console.error(err);
      setPasswordMessage("Server error while updating password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggleEditForm = () => {
    setShowEditForm((prev) => !prev);
    setEditMessage("");
    if (!showEditForm) {
      setEditName(detail?.name || "");
      setEditEmail(detail?.email || "");
    } else {
      setEditName("");
      setEditEmail("");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditMessage("");

    if (!editName && !editEmail) {
      setEditMessage("Please update at least one field.");
      return;
    }

    setEditLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });

      const response = await res.json();
      if (res.ok) {
        setEditMessage(response.message || "Profile updated successfully.");
        setDetail(response.user);
        setShowEditForm(false);
      } else {
        setEditMessage(response.message || "Unable to update profile.");
      }
    } catch (err) {
      console.error(err);
      setEditMessage("Server error while updating profile.");
    } finally {
      setEditLoading(false);
    }
  };
  const handlerideButton = (e) => {
    e.preventDefault();
    navigate("/ownerride");
  };

  const handleShowJoinedRides = async (e) => {
    e.preventDefault();
    setShowJoinedRides(true);
    setJoinedRidesLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/profile/joined/rides`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const response = await res.json();
      if (res.ok) {
        setJoinedRides(response.rides || []);
      } else {
        setJoinedRides([]);
      }
    } catch (err) {
      console.error(err);
      setJoinedRides([]);
    } finally {
      setJoinedRidesLoading(false);
    }
  };

  const handleChatWithOwner = async (rideId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideId,
        }),
        credentials: "include",
      });
      const data = await res.json();
      console.log(data);
      navigate(`/chat/${data.conversation._id}`);
    } catch (err) {
      console.log(err);
    }
  };
  if (loading) {
    return <div className="profile-page">Loading profile...</div>;
  }

  if (!detail) {
    return <div className="profile-page">Unable to load profile.</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-pic">
          <div className="avatar">{detail?.name?.charAt(0)?.toUpperCase()}</div>
        </div>
        <div className="profile-info">
          <h2 className="profile-info-text">Name: {detail.name}</h2>
          <h2 className="profile-info-text">Email: {detail.email}</h2>
          <h2 className="profile-info-text">
            Member Since{" "}
            {new Date(detail.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="profile-actions">
            <button className="createbutton" onClick={handleToggleEditForm}>
              {showEditForm ? "Cancel" : "Edit Profile"}
            </button>
            <button className="createbutton" onClick={handleTogglePasswordForm}>
              {showPasswordForm ? "Cancel" : "Change Password"}
            </button>
            <button className="createbutton" onClick={handleLogout}>
              Logout
            </button>
          </div>
          {showPasswordForm && (
            <form className="password-form" onSubmit={handlePasswordSubmit}>
              <div>
                <label className="changePasswordHeading">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="changePasswordHeading">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="changePasswordHeading">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                className="createbutton"
                type="submit"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Saving..." : "Save Password"}
              </button>
              {passwordMessage && (
                <p className="form-message">{passwordMessage}</p>
              )}
            </form>
          )}
          {showEditForm && (
            <form className="password-form" onSubmit={handleEditSubmit}>
              <div>
                <label className="changePasswordHeading">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="changePasswordHeading">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <button
                className="createbutton"
                type="submit"
                disabled={editLoading}
              >
                {editLoading ? "Saving..." : "Save Profile"}
              </button>
              {editMessage && <p className="form-message">{editMessage}</p>}
            </form>
          )}
        </div>
      </div>
      {showJoinedRides && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Joined Rides</h2>
              <button
                className="close-btn"
                onClick={() => setShowJoinedRides(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {joinedRidesLoading ? (
                <p>Loading joined rides...</p>
              ) : joinedRides.length > 0 ? (
                <div className="rides-list">
                  {joinedRides.map((ride) => (
                    <div key={ride._id} className="ride-card">
                      <div className="ride-details">
                        <p>
                          <strong>From:</strong> {ride.from}
                        </p>
                        <p>
                          <strong>To:</strong> {ride.to}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(ride.date).toLocaleDateString("en-IN")}
                        </p>
                        <p>
                          <strong>Time:</strong> {ride.time}
                        </p>
                        <p>
                          <strong>Cost:</strong> ₹{ride.cost}
                        </p>
                        <p>
                          <strong>Vehicle:</strong> {ride.vehiclename}
                        </p>
                        <p>
                          <strong>Owner:</strong> {ride.createdBy?.name}
                        </p>
                        <p>
                          <span className={`status-pill ${ride.status?.toLowerCase()}`}>
                            {ride.status === "Cancelled" && "🔴 CANCELLED"}
                            {ride.status === "Full" && "🟠 FULL"}
                            {ride.status !== "Cancelled" && ride.status !== "Full" && "🟢 ACTIVE"}
                          </span>
                        </p>
                      </div>
                      <button
                        className="createbutton"
                        onClick={() => handleChatWithOwner(ride._id)}
                      >
                        Chat
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>You haven't joined any rides yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
