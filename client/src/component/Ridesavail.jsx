import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Ridesavail() {
  const [allride, setAllride] = useState([]);
  const [message1, setMessage] = useState("");
  const [sendreqmessage, setSendReqMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [ReqConfirmPopup, setReqConfirmPopup] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const navigate = useNavigate();
  const availride = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/rides/avail", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (Array.isArray(data)) {
        setAllride(data);
      } else if (data.message) {
        setMessage(data.message);
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
      const res = await fetch("http://localhost:5000/api/chat/conversation", {
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
    if (selectedRide) {
      try {
        const res = await fetch(
          "http://localhost:5000/api/rides/bookingconfirm",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingreq: true,
              rideId: selectedRide,
            }),
            credentials: "include",
          },
        );
        const data = await res.json();
          setSendReqMessage(data.message);
          closeBookingPopup();
          setReqConfirmPopup(true);
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div>
      <h1 className="section-heading1">Available Rides</h1>
      {message1 && <h2 className="empty-message">{message1}</h2>}
      {allride.map((user) => (
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
            onClick={() => openBookingPopup(user._id)}
          >
            Book
          </button>
          <button className="book-button" onClick={() => chatbutton(user._id)}>
            Chat
          </button>
        </div>
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
              >
                Book Ride
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
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
