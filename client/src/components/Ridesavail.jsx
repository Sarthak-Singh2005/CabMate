import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import RideCard from "./RideCard";

export default function Ridesavail() {
  const [allride, setAllride] = useState([]);
  const [message1, setMessage] = useState("");
  const [sendreqmessage, setSendReqMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [ReqConfirmPopup, setReqConfirmPopup] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const navigate = useNavigate();

  const availride = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/avail`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setAllride(data);
      } else {
        setMessage(data.message || "No rides available.");
        setAllride([]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    availride();
  }, []);

  const chatbutton = async (rideId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rideId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate(`/chat/${data.conversation._id}`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const openBookingPopup = (rideId) => {
    setSelectedRide(rideId);
    setShowPopup(true);
  };

  const closeBookingPopup = () => {
    setShowPopup(false);
    setReqConfirmPopup(false);
    setSelectedRide(null);
  };

  const requestBooking = async () => {
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

      setSendReqMessage(data.message);

      closeBookingPopup();

      setReqConfirmPopup(true);
    } catch (err) {
      console.log(err);
    } finally {
      setIsRequesting(false);
    }
  };
  return (
    <div>
      <h1 className="section-heading1">Available Rides</h1>

      {message1 && <h2 className="empty-message">{message1}</h2>}

      {allride.map((user) => (
        <RideCard
          key={user._id}
          user={user}
          onBook={openBookingPopup}
          onChat={chatbutton}
        />
      ))}

      {showPopup && (
        <div className="popup">
          <div className="popup-container">
            <h2>Confirm Booking</h2>

            <p>Are you sure you want to book this ride?</p>

            <div className="popup-buttons">
              <button
                className="popup-btn cancel-btn"
                onClick={closeBookingPopup}
              >
                Cancel
              </button>

              <button
                className="popup-btn confirm-btn"
                onClick={requestBooking}
                disabled={isRequesting}
              >
                {isRequesting ? "Booking..." : "Book Ride"}
              </button>
            </div>
          </div>
        </div>
      )}

      {ReqConfirmPopup && (
        <div className="popup">
          <div className="popup-container">
            <h2>{sendreqmessage}</h2>

            <div className="popup-buttons">
              <button
                className="popup-btn cancel-btn"
                onClick={closeBookingPopup}
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
