import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import RideCard from "./RideCard";
import toast from "react-hot-toast";

export default function Searchride({ searcharr }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPopup, setShowPopup] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [highlightedRideId, setHighlightedRideId] = useState("");

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
              returnState: {
                restoredSearchResults: searcharr,
              },
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
  }, [location.state?.highlightChatSourceId, searcharr.length]);

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
    <div className="rides">
      <section className="ride-group">
        <h1 className="section-heading1">Available Rides based on Filters</h1>
        {searcharr.map((ride) => (
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
