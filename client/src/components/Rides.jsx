import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import "../index.css";
import Searchride from "./Searchride";
import Ridesavail from "./Ridesavail";
import { useNavigate, useParams } from "react-router-dom";
import Owneravail from "./Owneravail";


export default function Rides() {
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);
  const [popup, setPopup] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const search = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setResults([]);
      const res = await fetch("http://localhost:5000/api/rides/findride", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          date,
        }),
        credentials: "include",
      });

      const response = await res.json();

      setLoading(false);

      if (res.ok) {
        setResults(response.availride);
      } else {
        setPopup(response.message);

        setTimeout(() => {
          setPopup("");
        }, 3000);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const handlebutton = (e) => {
    e.preventDefault();
    navigate("/createride");
  };
  const handlerideButton = (e) => {
    e.preventDefault();
    navigate(`/ownerride`);
  };
  return (
    <div className="rides">
      <div className="search-ride-card">
        <h1 className="search-form-heading">Search for Rides</h1>

        <form onSubmit={search} className="search-rides-card">
          <div className="form-field1">
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
          </div>

          <div className="form-field1">
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
          </div>

          <div className="form-field1">
            <label className="searchText" htmlFor="date">
              Date
            </label>

            <input
              onChange={(e) => setDate(e.target.value)}
              className="searchBar"
              id="date"
              type="date"
            />
          </div>

          <button type="submit" className="searchButton">
            <FaSearch size={40} />
          </button>
        </form>
      </div>

      <div className="createRide">
        <button className="createbutton" onClick={handlerideButton}>
          Your Rides
        </button>
        <button className="createbutton" onClick={handlebutton}>
          Post New Ride
        </button>
      </div>

      {popup && <div className="popup-message">{popup}</div>}

      {loading && <h1 className="loading">Searching...</h1>}

      {results.length > 0 ? <Searchride searcharr={results} /> : <Ridesavail />}
    </div>
  );
}
