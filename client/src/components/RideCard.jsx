import React from "react";

export default function RideCard({
  user,
  onBook,
  onChat,
}) {
  return (
    <div className="avail-ride-card">
      <div className="avail-ride-card1">
        <h1>From: {user.from}</h1>

        <h1>To: {user.to}</h1>

        <h1>
          Date:{" "}
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

        <h1>Cost: ₹{user.cost}</h1>

        <h1>
          <span className={`status-pill ${user.status?.toLowerCase()}`}>
            {user.status === "Cancelled" && "🔴 CANCELLED"}
            {user.status === "Full" && "🟠 FULL"}
            {user.status !== "Cancelled" &&
              user.status !== "Full" &&
              "🟢 ACTIVE"}
          </span>
        </h1>
      </div>

      <div className="avail-ride-card2">
        {user.message?.length > 0 && (
          <div className="additional">
            <h1>Additional Message: {user.message}</h1>
          </div>
        )}
      </div>

      {onBook &&
        user.status !== "Cancelled" &&
        user.status !== "Full" && (
          <button
            className="book-button"
            onClick={() => onBook(user._id)}
          >
            Book
          </button>
        )}

      <button
        className="book-button"
        onClick={() => onChat(user._id)}
      >
        Chat
      </button>
    </div>
  );
}