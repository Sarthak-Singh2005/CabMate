import React from "react";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import "../index.css";
import Ridesavail from "./Ridesavail";
import { useNavigate } from "react-router-dom";
export default function Rides() {
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const search = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/rides/findrides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, from }),
        credentials: "include",
      })
      const response = await res.json();
      console.log("location", response);
      if (!res.ok) {
        // server returned an error (e.g. no rides)
        setResults([]);
      } else {
        setResults(response.availride || []);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handlebutton = async (e) => {
    e.preventDefault();
    navigate("/createride");
  };
  return (
    <div>
      <form onSubmit={search} className="rides">
        <label className="searchText" htmlFor="from">
          From
        </label>
        <input
          onChange={(e) => setFrom(e.target.value)}
          className="searchBar"
          id="from"
          placeholder="Current Location"
          type="text"
        />
        <label className="searchText" htmlFor="to">
          To
        </label>
        <input
          onChange={(e) => setTo(e.target.value)}
          className="searchBar"
          id="to"
          placeholder="Destination"
          type="text"
        />
        <button type="submit" className="searchButton">
          <FaSearch size={40} />
        </button>
      </form>
      <div className="createRide">
        <button className="createButton" onClick={handlebutton}>
          Create Ride
        </button>
      </div>
      {/* <Ridesavail/> */}
    </div>
  );
}
