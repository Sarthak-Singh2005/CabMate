import React, { useEffect, useState } from "react";

export default function Ridesavail() {
  const [allride, setAllride] = useState([]);
  const availride = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/rides/avail", {
        method: "GET",
        credentials: "include",
      });
      const response = await res.json();
      setAllride(response);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    availride();
  }, []);
  return (
    <div>
      {allride.map((user) => {
        return (
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
            
            {user.phone?.length > 0 && <h1>{user.phoneno}</h1>}
            <h1>Cost: {user.cost}</h1>
            
          </div>
          <div className="avail-ride-card2">
              {user.message?.length > 0 && <div className="additional"><h1>Addition Message: {user.message}</h1></div>}
              
            </div>
            <button className="book-button">Book</button>
            </div>
        );
      })}
    </div>
  );
}
