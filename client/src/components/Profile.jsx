import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../config/api";
import toast from "react-hot-toast";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
export default function Profile() {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editLoading, setEditLoading] = useState(false);
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
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem("userId");
        window.dispatchEvent(new Event("cabmate-auth-change"));

        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordForm = () => {
    setShowEditForm(false);

    const nextOpen = !showPasswordForm;
    setShowPasswordForm(nextOpen);

    setPasswordMessage("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
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
      });

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
    setShowPasswordForm(false);

    const nextOpen = !showEditForm;
    setShowEditForm(nextOpen);

    setEditMessage("");

    if (nextOpen) {
      setEditName(detail?.name || "");
    } else {
      setEditName("");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditMessage("");

    if (!editName.trim()) {
      setEditMessage("Name cannot be empty.");
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
        body: JSON.stringify({ name: editName }),
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
          <h2 className="profile-info-text">Mobile Number: {detail.phone}</h2>
          <h2 className="profile-info-text">
            Gender: {detail.gender || "Not specified"}
          </h2>
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
            <button
              className="createbutton"
              disabled={loading}
              onClick={handleLogout}
            >
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
          {showPasswordForm && (
            <form className="password-form" onSubmit={handlePasswordSubmit}>
              <div>
                <label className="changePasswordHeading">
                  Current Password
                </label>
                <div className="password-field-wrapper">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    aria-label={
                      showCurrentPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? (
                      <HiOutlineEyeSlash />
                    ) : (
                      <HiOutlineEye />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="changePasswordHeading">New Password</label>
                <div className="password-field-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}
                  >
                    {showNewPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>
              <div>
                <label className="changePasswordHeading">
                  Confirm New Password
                </label>
                <div className="password-field-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <HiOutlineEyeSlash />
                    ) : (
                      <HiOutlineEye />
                    )}
                  </button>
                </div>
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
    </div>
  );
}
