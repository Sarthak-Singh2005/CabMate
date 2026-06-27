import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";
export default function Owneravail() {
  const [ownride, setOwnride] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const ownerride = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/rides/owner", {
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
      console.log(err);
    }
  };
  const editride = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/rides/edit/:id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:{
            from,
          to,
          time,
          date,
          cost,
          phoneno,
          message,
          vehiclename,
          vacantseat,
        },
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
      console.log(err);
    }
  };
  useEffect(() => {
    ownerride();
  }, []);
  return (
    <div>
      {message && <h2 className="empty-message">{message}</h2>}

      {ownride.map((user) => (
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
        </div>
      ))}
    </div>
  );
}
