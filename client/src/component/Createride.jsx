import React from "react";
import { useState } from "react";
import "../index.css";
export default function Createride() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [time, setTime] = useState("");
  const [phoneno, setPhoneno] = useState("");
  const [message, setMessage] = useState("");
  const [vehiclename, setVehiclename] = useState("");
  const [vacantseat, setVacantseat] = useState("");
  const handlecreateride = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/rides/createride", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          time,
          phoneno,
          message,
          vehiclename,
          vacantseat,
        }),
        credentials: "include",
      });
      const data = await res.json();
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="create-ride-page">
      <div className="create-ride-card">
        <div className="create-ride-header">
          <h1 className="head">Share Your Ride</h1>
          <p className="create-ride-subtitle">
            Enter your trip details so passengers can easily find and join your ride.
            Keep the info clear and complete.
          </p>
        </div>
        <form className="createrideform" onSubmit={handlecreateride}>
          <div className="form-field">
            <label htmlFor="from">Pickup Location<span style={{color:"red"}}>*</span></label>
            <input
              id="from"
              placeholder="Enter pickup location"
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="to">Destination<span style={{color:"red"}}>*</span></label>
            <input
              id="to"
              placeholder="Enter destination"
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="name">Departure Time<span style={{color:"red"}}>*</span></label>
            <input
              id="time"
              placeholder="Select departure time"
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="vacantseat">Available Seats<span style={{color:"red"}}>*</span></label>
            <input
              id="vacantseat"
              type="number"
              min="1"
              placeholder="Enter available seats"
              onChange={(e) => setVacantseat(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="phoneno">Contact Number</label>
            <input
              id="phoneno"
              type="tel"
              placeholder="Enter contact number"
              onChange={(e) => setPhoneno(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="vehiclename">Vehicle name</label>
            <input
              id="vehiclename"
              placeholder="Cab model"
              onChange={(e) => setVehiclename(e.target.value)}
            />
          </div>
          <div className="form-field full-width">
            <label htmlFor="message">Additional Notes</label>
            <textarea
              id="message"
              name="message"
              placeholder="Add more trip details"
              onChange={(e) => setMessage(e.target.value)}
            ></textarea> 
          </div>
          <button className="createbutton" type="submit">
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
