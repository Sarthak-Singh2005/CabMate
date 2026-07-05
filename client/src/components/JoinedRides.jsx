import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";
import "../index.css";

import { API_BASE_URL } from "../config/api";
export default function JoinedRides() {
  const [joinedRides, setJoinedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const userId = useCurrentUser();

  useEffect(() => {
    const fetchJoinedRides = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/joined/rides`, {
          method: "GET",
          credentials: "include",
        });
        const response = await res.json();
        if (res.ok) {
          setJoinedRides(response.rides || []);
        } else {
          setError(response.message || "Unable to load joined rides.");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load joined rides.");
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedRides();
  }, []);

  const handleChatWithOwner = async (rideId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rideId }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.conversation?._id) {
        navigate(`/chat/${data.conversation._id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="joined-rides-page">
      <h1 className="section-heading1">Joined Rides</h1>

      <div className="joined-rides-list">
        {loading ? (
          <p className="joined-rides-message">Loading joined rides...</p>
        ) : error ? (
          <p className="joined-rides-message">{error}</p>
        ) : joinedRides.length === 0 ? (
          <p className="joined-rides-message">
            You haven't joined any rides yet.
          </p>
        ) : (
          joinedRides.map((ride) => (
            <div className="avail-ride-card" key={ride._id}>
              <div className="avail-ride-card1">
                <h1>From: {ride.from}</h1>
                <h1>To: {ride.to}</h1>

                <h1>
                  Date:{" "}
                  {new Date(ride.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </h1>

                <h1>Time: {ride.time}</h1>
                <h1>Vacant Seat: {ride.vacantseat}</h1>
                <h1>Vehicle Name: {ride.vehiclename}</h1>

                {ride.phoneno?.length > 0 && <h1>{ride.phoneno}</h1>}

                <h1>Cost: {ride.cost}</h1>

                <h1>
                  <span className={`status-pill ${ride.status?.toLowerCase()}`}>
                    {ride.status === "Cancelled" && "🔴 CANCELLED"}
                    {ride.status === "Full" && "🟠 FULL"}
                    {ride.status !== "Cancelled" &&
                      ride.status !== "Full" &&
                      "🟢 ACTIVE"}
                  </span>
                </h1>
              </div>

              <div className="avail-ride-card2">
                {ride.message?.length > 0 && (
                  <div className="additional">
                    <h1>Additional Message: {ride.message}</h1>
                  </div>
                )}
              </div>

              <div className="joined-ride-action">
                <button
                  className="joined-ride-chat-button"
                  onClick={() => handleChatWithOwner(ride._id)}
                >
                  Chat
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
