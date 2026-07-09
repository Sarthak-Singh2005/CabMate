export default function RideCard({
  ride,
  actions,
  highlighted = false,
  showPhone = false,
}) {
  const ownerName = ride.createdBy?.name;
  const ownerGender = ride.createdBy?.gender;
  const maleFriends = Number(ride.maletravel || 0);
  const femaleFriends = Number(ride.femaletravel || 0);
  const acceptedRequests = Array.isArray(ride.bookingRequests)
    ? ride.bookingRequests.filter((request) => request.status === "accepted")
    : [];
  const acceptedMaleCount = acceptedRequests.filter(
    (request) => request.user?.gender === "Male",
  ).length;
  const acceptedFemaleCount = acceptedRequests.filter(
    (request) => request.user?.gender === "Female",
  ).length;
  const totalMaleParticipants = maleFriends + acceptedMaleCount;
  const totalFemaleParticipants = femaleFriends + acceptedFemaleCount;

  const formattedDate = new Date(ride.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const rideDate = new Date(ride.date);
  const rideDay = new Date(
    rideDate.getFullYear(),
    rideDate.getMonth(),
    rideDate.getDate(),
  );
  const storedStatus = ride.status?.toLowerCase();
  const status =
    storedStatus === "available" && rideDay < todayStart
      ? "completed"
      : storedStatus || "available";

  const statusLabels = {
    available: "ACTIVE",
    cancelled: "CANCELLED",
    full: "FULL",
    completed: "COMPLETED",
  };

  const statusText = statusLabels[status] || status.toUpperCase();
  const detailItems = [
    ["Pickup", ride.from],
    ["Destination", ride.to],
    ["Travel Date", formattedDate],
    ["Departure Time", ride.time],
    ["Seat Available", ride.vacantseat],
    ["Vehicle Name", ride.vehiclename],
    ...(showPhone && ride.phoneno ? [["Mobile Number", ride.phoneno]] : []),
    ["Cost", `₹${ride.cost}`],
  ];

  return (
    <div
      id={`chat-source-${ride._id}`}
      className={`avail-ride-card ${highlighted ? "chat-source-highlight" : ""}`}
    >
      <div className="ride-card-top">
        {(ownerName || ownerGender) && (
          <div className="ride-owner-info">
            {ownerName && <h2>Owner: {ownerName}</h2>}
            {ownerGender && <p>({ownerGender})</p>}
          </div>
        )}

        <span className={`status-pill ${status}`}>{statusText}</span>
      </div>

      <div className="avail-ride-card1">
        {detailItems.map(([label, value]) => (
          <div className="ride-detail-item" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}

        <div className="participant-section">
          <p>Confirmed Passengers</p>
          <div className="participant-counts">
            <div className="participant-count">
              <span className="participant-label">Male</span>
              <strong>{totalMaleParticipants}</strong>
            </div>
            <div className="participant-count">
              <span className="participant-label">Female</span>
              <strong>{totalFemaleParticipants}</strong>
            </div>
          </div>
        </div>
      </div>

      {ride.message && (
        <div className="avail-ride-card2">
          <div className="additional">
            <span>Additional Note</span>
            <strong>{ride.message}</strong>
          </div>
        </div>
      )}

      {actions && <div className="ride-card-actions">{actions}</div>}
    </div>
  );
}
