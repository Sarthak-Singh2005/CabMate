import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import "../index.css";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
export default function Owneravail() {
  const [ownride, setOwnride] = useState([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const navigate = useNavigate();
  const ownerride = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/owner`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setOwnride(data);
      } else if (data.message) {
        setMessage(data.message);
        setOwnride([]);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const cancelRide = async (rideId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/rides/owner/cancel/${rideId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rideId: rideId,
          }),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (res.ok) {
        ownerride();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const getRideDateOnly = (ride) => {
    const rideDate = new Date(ride.date);
    return new Date(
      rideDate.getFullYear(),
      rideDate.getMonth(),
      rideDate.getDate(),
    );
  };

  const upcomingRides = ownride
    .filter((ride) => {
      const rideDay = getRideDateOnly(ride);
      return ride.status !== "Cancelled" && rideDay >= todayStart;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const previousRides = ownride
    .filter((ride) => {
      const rideDay = getRideDateOnly(ride);
      return ride.status !== "Cancelled" && rideDay < todayStart;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const cancelledRides = ownride.filter((ride) => ride.status === "Cancelled");

  const renderRideCard = (user) => (
    <div className="avail-ride-card" key={user._id}>
      <div className="avail-ride-card1">
        <h1>From: {user.from}</h1>
        <h1>To: {user.to}</h1>
        <h1>
          Date:
          {new Date(user.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </h1>
        <h1>Time: {user.time}</h1>
        <h1>Vacant Seat: {user.vacantseat}</h1>
        <h1>Vehicle Name: {user.vehiclename}</h1>

        {user.phoneno?.length > 0 && <h1>{user.phoneno}</h1>}
        <h1>Cost: {user.cost}</h1>
        <h1>
          {(() => {
            const s = (user.status || "").toString().trim().toLowerCase();
            let cls = "active";
            let text = "🟢 ACTIVE";
            if (s === "cancelled" || s === "canceled") {
              cls = "cancelled";
              text = "🔴 CANCELLED";
            } else if (s === "full") {
              cls = "full";
              text = "🟠 FULL";
            }
            return <span className={`status-pill ${cls}`}>{text}</span>;
          })()}
        </h1>
      </div>

      <div className="avail-ride-card2">
        {user.message?.length > 0 && (
          <div className="additional">
            <h1>Additional Message: {user.message}</h1>
          </div>
        )}
      </div>
      <button
        className="book-button"
        onClick={() => navigate(`/ownerchats/${user._id}`)}
      >
        Requests & Chats
      </button>
      <button
        className="book-button"
        onClick={() => navigate(`/${user._id}/edit`)}
      >
        Edit
      </button>
      {user.status !== "Cancelled" && (
        <button
          className="book-button"
          onClick={() => cancelRide(`${user._id}`)}
        >
          Cancel
        </button>
      )}
    </div>
  );

  useEffect(() => {
    ownerride();
  }, []);

  return (
    <div>
      <div className="rides">
        <h1 className="section-heading">Your Posted Rides</h1>
        {message && <h2 className="empty-message">{message}</h2>}

        <div className="tab-bar">
          <button
            className={`tab-button ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`tab-button ${activeTab === "previous" ? "active" : ""}`}
            onClick={() => setActiveTab("previous")}
          >
            Previous
          </button>
          <button
            className={`tab-button ${activeTab === "cancelled" ? "active" : ""}`}
            onClick={() => setActiveTab("cancelled")}
          >
            Cancelled
          </button>
        </div>

        <section className="ride-group">
          <div className="ride-group-heading">
            <h2>
              {activeTab === "upcoming"
                ? "Upcoming Rides"
                : activeTab === "previous"
                  ? "Previous Rides"
                  : "Cancelled Rides"}
            </h2>
            <p>
              {activeTab === "upcoming"
                ? `${upcomingRides.length} ride(s)`
                : activeTab === "previous"
                  ? `${previousRides.length} ride(s)`
                  : `${cancelledRides.length} ride(s)`}
            </p>
          </div>
          {activeTab === "upcoming" &&
            (upcomingRides.length > 0 ? (
              upcomingRides.map((ride) => renderRideCard(ride))
            ) : (
              <p className="empty-message">No upcoming rides found.</p>
            ))}
          {activeTab === "previous" &&
            (previousRides.length > 0 ? (
              previousRides.map((ride) => renderRideCard(ride))
            ) : (
              <p className="empty-message">No previous rides found.</p>
            ))}
          {activeTab === "cancelled" &&
            (cancelledRides.length > 0 ? (
              cancelledRides.map((ride) => renderRideCard(ride))
            ) : (
              <p className="empty-message">No cancelled rides found.</p>
            ))}
        </section>
      </div>
    </div>
  );
}
