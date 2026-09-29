import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import RideCard from "./RideCard";
import toast from "react-hot-toast";

export default function Ridesavail() {
  const [allRide, setAllRide] = useState([]);
  const [message, setMessage] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [highlightedRideId, setHighlightedRideId] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const fetchAvailableRides = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/avail`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setAllRide(data);
      } else {
        setMessage(data.message || "No rides available.");
        setAllRide([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchTimer = setTimeout(() => {
      fetchAvailableRides();
    }, 0);

    return () => clearTimeout(fetchTimer);
  }, []);

  useEffect(() => {
    const highlightId = location.state?.highlightChatSourceId;

    if (!highlightId) return;

    const scrollTimer = setTimeout(() => {
      setHighlightedRideId(highlightId);
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
  }, [location.state?.highlightChatSourceId, allRide.length]);

  const handleChat = async (rideId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ rideId }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate(`/chat/${data.conversation._id}`, {
          state: {
            chatSource: {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
              highlightId: rideId,
              highlightType: "ride",
            },
          },
        });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = (rideId) => {
    setSelectedRide(rideId);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setShowConfirmationPopup(false);
    setSelectedRide(null);
  };

  const handleBookingRequest = async () => {
    if (!selectedRide || isRequesting) return;

    setIsRequesting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/bookingconfirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bookingreq: true,
          rideId: selectedRide,
        }),
      });

      const data = await res.json();

      setRequestMessage(data.message);

      handleClosePopup();

      setShowConfirmationPopup(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div>
      <section className="ride-group">
        <h1 className="section-heading1">Available Rides</h1>
        {message && <h2 className="empty-message">{message}</h2>}
        {allRide.map((ride) => (
          <RideCard
            key={ride._id}
            ride={ride}
            highlighted={highlightedRideId === ride._id}
            actions={
              <>
                {ride.status !== "Cancelled" && ride.status !== "Full" && (
                  <button
                    className="book-button"
                    onClick={() => handleBook(ride._id)}
                  >
                    Book
                  </button>
                )}

                <button
                  className="book-button"
                  onClick={() => handleChat(ride._id)}
                >
                  Chat
                </button>
              </>
            }
          />
        ))}
      </section>

      {showPopup && (
        <div className="popup">
          <div className="popup-container">
            <h2>Confirm Booking</h2>

            <p>Are you sure you want to book this ride?</p>

            <div className="popup-buttons">
              <button
                className="popup-btn cancel-btn"
                onClick={handleClosePopup}
              >
                Cancel
              </button>

              <button
                className="popup-btn confirm-btn"
                onClick={handleBookingRequest}
                disabled={isRequesting}
              >
                {isRequesting ? "Booking..." : "Book Ride"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmationPopup && (
        <div className="popup">
          <div className="popup-container">
            <h2>{requestMessage}</h2>

            <div className="popup-buttons">
              <button
                className="popup-btn cancel-btn"
                onClick={handleClosePopup}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
