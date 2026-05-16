import React from "react";
export default function   Info() {
  return (
    <div className="infobox">
      <h1>
        <div style={{ color: "purple", fontSize: "70px" }}>Ride Together</div>
        <div style={{ color: "white", fontSize: "70px" }}>Save Together</div>
      </h1>
      <p className="description">
        Find and share cab rides easily. CabMate helps discovering available
        shared rides in one place, making travel more affordable.
      </p>
      <button className="explore">Explore Rides</button>
    </div>
  );
}
