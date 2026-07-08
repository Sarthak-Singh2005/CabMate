import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../index.css";
import RideCard from "./RideCard";
import { API_BASE_URL } from "../config/api";

export default function JoinedRides() {
  const [joinedRides, setJoinedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  const navigate = useNavigate();
  const location = useLocation();
  const [highlightedRideId, setHighlightedRideId] = useState("");

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
        navigate(`/chat/${data.conversation._id}`, {
          state: {
            chatSource: {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
              highlightId: rideId,
              highlightType: "ride",
              activeTab,
            },
          },
        });
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

  const upcomingRides = joinedRides
    .filter((ride) => {
      const rideDay = getRideDateOnly(ride);
      return ride.status !== "Cancelled" && rideDay >= todayStart;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const previousRides = joinedRides
    .filter((ride) => {
      const rideDay = getRideDateOnly(ride);
      return ride.status !== "Cancelled" && rideDay < todayStart;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const cancelledRides = joinedRides.filter(
    (ride) => ride.status === "Cancelled",
  );

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  useEffect(() => {
    const highlightId = location.state?.highlightChatSourceId;

    if (!highlightId) return;

    setHighlightedRideId(highlightId);

    const scrollTimer = setTimeout(() => {
      document
        .getElementById(`chat-source-${highlightId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    const clearTimer = setTimeout(() => {
      setHighlightedRideId("");
    }, 4000);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [location.state?.highlightChatSourceId, activeTab, joinedRides.length]);

  const renderRide = (ride) => (
    <RideCard
      key={ride._id}
      ride={ride}
      highlighted={highlightedRideId === ride._id}
      actions={
        <button
          className="book-button"
          onClick={() => handleChatWithOwner(ride._id)}
        >
          Chat
        </button>
      }
    />
  );

  return (
    <div>
      <div className="rides">
        <h1 className="section-heading">Joined Rides</h1>

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
          {loading ? (
            <p className="empty-message">Loading joined rides...</p>
          ) : error ? (
            <p className="empty-message">{error}</p>
          ) : activeTab === "upcoming" ? (
            upcomingRides.length > 0 ? (
              upcomingRides.map(renderRide)
            ) : (
              <p className="empty-message">No upcoming rides found.</p>
            )
          ) : activeTab === "previous" ? (
            previousRides.length > 0 ? (
              previousRides.map(renderRide)
            ) : (
              <p className="empty-message">No previous rides found.</p>
            )
          ) : cancelledRides.length > 0 ? (
            cancelledRides.map(renderRide)
          ) : (
            <p className="empty-message">No cancelled rides found.</p>
          )}
        </section>
      </div>
    </div>
  );
}
