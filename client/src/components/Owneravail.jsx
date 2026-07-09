import { useState, useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import "../index.css";
import RideCard from "./RideCard";
import { API_BASE_URL } from "../config/api";
export default function Owneravail() {
  const [ownride, setOwnerRide] = useState([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(false);
  const [highlightedRideId, setHighlightedRideId] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const fetchOwnerRides = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/owner`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (Array.isArray(data)) {
       setOwnerRide(data);
      } else if (data.message) {
        setMessage(data.message);
       setOwnerRide([]);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const cancelRide = async (rideId) => {
    try {
      setLoading(true);
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
      if (res.ok) {
        fetchOwnerRides();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const getRideTab = (ride) => {
    if (!ride) return "";
    if (ride.status === "Cancelled") return "cancelled";

    const rideDay = getRideDateOnly(ride);
    return rideDay < todayStart ? "previous" : "upcoming";
  };

  const getRideSource = (rideId) => ({
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    highlightId: rideId,
    activeTab,
  });

  const renderRide = (ride) => (
    <RideCard
      key={ride._id}
      ride={ride}
      highlighted={highlightedRideId === ride._id}
      actions={
        <>
          <button
            className="book-button"
            onClick={() =>
              navigate(`/ownerchats/${ride._id}`, {
                state: { rideSource: getRideSource(ride._id) },
              })
            }
          >
            Requests & Chats
          </button>

          <button
            className="book-button"
            onClick={() =>
              navigate(`/${ride._id}/edit`, {
                state: { rideSource: getRideSource(ride._id) },
              })
            }
          >
            Edit
          </button>

          {ride.status !== "Cancelled" && (
            <button
              className="book-button"
              disabled={loading}
              onClick={() => cancelRide(ride._id)}
            >
              {loading ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </>
      }
    />
  );

  useEffect(() => {
    fetchOwnerRides();
  }, []);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  useEffect(() => {
    const highlightId = location.state?.highlightChatSourceId;

    if (!highlightId) return;

    const highlightedRide = ownride.find(
      (ride) => ride._id?.toString() === highlightId.toString(),
    );
    const targetTab = location.state?.activeTab || getRideTab(highlightedRide);

    if (targetTab && activeTab !== targetTab) {
      setActiveTab(targetTab);
      return;
    }

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
  }, [
    location.state?.activeTab,
    location.state?.highlightChatSourceId,
    activeTab,
    ownride,
  ]);

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
              upcomingRides.map(renderRide)
            ) : (
              <p className="empty-message">No upcoming rides found.</p>
            ))}
          {activeTab === "previous" &&
            (previousRides.length > 0 ? (
              previousRides.map(renderRide)
            ) : (
              <p className="empty-message">No previous rides found.</p>
            ))}
          {activeTab === "cancelled" &&
            (cancelledRides.length > 0 ? (
              cancelledRides.map(renderRide)
            ) : (
              <p className="empty-message">No cancelled rides found.</p>
            ))}
        </section>
      </div>
    </div>
  );
}
