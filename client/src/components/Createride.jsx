import React from "react";
import { useState, useEffect } from "react";
import "../index.css";
import { API_BASE_URL } from "../config/api"
import { useNavigate, useParams } from "react-router-dom";
export default function Createride() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [phoneno, setPhoneno] = useState("");
  const [message, setMessage] = useState("");
  const [vehiclename, setVehiclename] = useState("");
  const [vacantseat, setVacantseat] = useState("");
  const [cost, setCost] = useState("");
  const navigate = useNavigate();
  const { id1 } = useParams();
  const isEdit = Boolean(id1);
  const handlecreateride = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        isEdit
          ? `${API_BASE_URL}/api/rides/${id1}/edit`
          : `${API_BASE_URL}/api/rides/createride`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: from,
            to: to,
            time: time,
            date: date,
            cost: cost,
            phoneno: phoneno,
            message: message,
            vehiclename: vehiclename,
            vacantseat: vacantseat,
          }),
          credentials: "include",
        },
      );
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        alert(data.message);
        navigate("/rides");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchRide = async () => {
      if (!isEdit) return;
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/rides/fetchedit/${id1}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await res.json();
        console.log("q", data);
        if (res.ok) {
          const ride = data;

          setFrom(ride.from || "");
          setTo(ride.to || "");
          setTime(ride.time || "");
          setDate(ride.date ? ride.date.split("T")[0] : "");
          setCost(ride.cost || "");
          setPhoneno(ride.phoneno || "");
          setMessage(ride.message || "");
          setVehiclename(ride.vehiclename || "");
          setVacantseat(ride.vacantseat ?? "");
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchRide();
  }, [id1, isEdit]);

  return (
    <div className="create-ride-page">
      <div className="create-ride-card">
        <div className="create-ride-header">
          <h1 className="head">Share Your Ride</h1>
          <p className="create-ride-subtitle">
            Enter your trip details so passengers can easily find and join your
            ride. Keep the info clear and complete.
          </p>
        </div>
        <form className="createrideform" onSubmit={handlecreateride}>
          <div className="form-field">
            <label htmlFor="from">
              Pickup Location<span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="from"
              placeholder="Enter pickup location"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="to">
              Destination<span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="to"
              placeholder="Enter destination"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            ></input>
          </div>
          <div className="form-field">
            <label htmlFor="name">
              Departure Time<span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="time"
              type="time"
              placeholder="Select departure time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="vacantseat">
              Available Seats<span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="vacantseat"
              type="number"
              min="0"
              placeholder="Enter available seats"
              value={vacantseat}
              onChange={(e) => setVacantseat(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="name">
              Date<span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="name">
              Cost(₹)<span style={{ color: "red" }}>*</span>
            </label>
            <input
              placeholder="Appoximate Cost per person"
              type="number"
              min="0"
              id="cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="vehiclename">
              Vehicle name<span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="vehiclename"
              placeholder="eg Maruti Suzuki Wagon R,Innova,etc"
              value={vehiclename}
              onChange={(e) => setVehiclename(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="phoneno">Contact Number</label>
            <input
              id="phoneno"
              type="tel"
              placeholder="Enter contact number"
              value={phoneno}
              onChange={(e) => setPhoneno(e.target.value)}
            />
          </div>
          <div className="form-field full-width">
            <label htmlFor="message">Additional Notes</label>
            <textarea
              id="message"
              name="message"
              placeholder="Add more trip details"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>

          <button className="createbutton" type="submit">
            {isEdit ? "Save" : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
