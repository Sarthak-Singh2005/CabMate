export default function RideCard({ ride, actions, highlighted = false }) {
  const formattedDate = new Date(ride.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const status = ride.status?.toLowerCase();

  let statusText = "🟢 ACTIVE";

  if (status === "cancelled") {
    statusText = "🔴 CANCELLED";
  } else if (status === "full") {
    statusText = "🟠 FULL";
  }

  return (
    <div
      id={`chat-source-${ride._id}`}
      className={`avail-ride-card ${highlighted ? "chat-source-highlight" : ""}`}
    >
      <div className="avail-ride-card1">
        <h1>Pickup Location: {ride.from}</h1>

        <h1>Destination: {ride.to}</h1>

        <h1>Travel Date: {formattedDate}</h1>

        <h1>Departure Time: {ride.time}</h1>

        <h1>Seat Available: {ride.vacantseat}</h1>

        <h1>Vehicle Name: {ride.vehiclename}</h1>

        {ride.phoneno && <h1>Phone: {ride.phoneno}</h1>}

        <h1>Cost: ₹{ride.cost}</h1>

        <h1>
          <span className={`status-pill ${status}`}>{statusText}</span>
        </h1>
      </div>

      {ride.message && (
        <div className="avail-ride-card2">
          <div className="additional">
            <h1>Additional Note: {ride.message}</h1>
          </div>
        </div>
      )}

      {actions && <div className="ride-card-actions">{actions}</div>}
    </div>
  );
}
