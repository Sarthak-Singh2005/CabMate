import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Profile() {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { profileId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5000/api/profile/${profileId}`,

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
    const res = await fetch(
      "http://localhost:5000/api/auth/logout",
      {
        method: "POST",
        credentials: "include",
      }
    );

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
  const handlerideButton = (e) => {
    e.preventDefault();
    navigate("/ownerride");
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
            <button className="createbutton">Edit Profile</button>
            <button className="createbutton">Change Password</button>
            <button className="createbutton" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        <div className="rides-info">
          <h2 className="ride-info-text" onClick={handlerideButton}>
            Posted Rides
          </h2>
          <h2 className="ride-info-text" onClick={handlerideButton}>
            Joined Rides
          </h2>
        </div>
      </div>
    </div>
  );
}
