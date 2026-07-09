import { useState, useEffect } from "react";
import "../index.css";
import { API_BASE_URL } from "../config/api";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
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
  const [maletravel, setMaleTravel] = useState("");
  const [femaletravel, setFemaleTravel] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { id1 } = useParams();
  const isEdit = Boolean(id1);

  const handleBack = () => {
    const rideSource = location.state?.rideSource;

    if (rideSource?.pathname) {
      navigate(
        `${rideSource.pathname}${rideSource.search || ""}${rideSource.hash || ""}`,
        {
          state: {
            highlightChatSourceId: rideSource.highlightId,
            activeTab: rideSource.activeTab,
          },
        },
      );
      return;
    }

    navigate(-1);
  };

  const handlecreateride = async (e) => {
    e.preventDefault();
    setLoading(true);
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
            maletravel: maletravel,
            femaletravel: femaletravel,
          }),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        if (isEdit && location.state?.rideSource?.pathname) {
          const rideSource = location.state.rideSource;
          navigate(
            `${rideSource.pathname}${rideSource.search || ""}${rideSource.hash || ""}`,
            {
              state: {
                highlightChatSourceId: rideSource.highlightId,
                activeTab: rideSource.activeTab,
              },
            },
          );
        } else {
          navigate("/ownerride");
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRide = async () => {
      if (!isEdit) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/rides/fetchedit/${id1}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
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
          setMaleTravel(ride.maletravel ?? "");
          setFemaleTravel(ride.femaletravel ?? "");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchRide();
  }, [id1, isEdit]);

  return (
    <div className="create-ride-page">
      <div className="create-ride-card">
        <div
          className={`create-ride-header ${
            isEdit ? "create-ride-header-with-back" : ""
          }`}
        >
          {isEdit && (
            <button
              type="button"
              className="btnform create-ride-back"
              onClick={handleBack}
            >
              Back
            </button>
          )}
          <h1 className="head">{isEdit ? "Edit Your Ride" : "Share Your Ride"}</h1>
          <p className="create-ride-subtitle">
            Enter your trip details so passengers can easily find and join your
            ride. Keep the info clear and complete.
          </p>
        </div>
        <form className="createrideform" onSubmit={handlecreateride}>
          <div className="form-field">
            <label htmlFor="from">
              Pickup<span style={{ color: "red" }}>*</span>
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
              Travel Date<span style={{ color: "red" }}>*</span>
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
              Seats Available<span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="vacantseat"
              type="number"
              min="1"
              placeholder="e.g. 2"
              value={vacantseat}
              onChange={(e) => setVacantseat(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="name">
              Fare per Seat (₹)<span style={{ color: "red" }}>*</span>
            </label>
            <input
              placeholder="Appox. cost per person e.g. 150"
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
              placeholder="e.g. Maruti Suzuki, Innova, not decided till now"
              value={vehiclename}
              onChange={(e) => setVehiclename(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="maletravel">Male Friends Already Travelling</label>
            <input
              id="maletravel"
              type="number"
              min="0"
              placeholder="e.g. 2"
              value={maletravel}
              onChange={(e) => setMaleTravel(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="femaletravel">
              Female Friends Already Travelling
            </label>
            <input
              id="femaletravel"
              type="number"
              min="0"
              placeholder="e.g. 2"
              value={femaletravel}
              onChange={(e) => setFemaleTravel(e.target.value)}
            />
          </div>
          <div className="form-field full-width">
            <label htmlFor="message">Additional Notes</label>
            <textarea
              id="message"
              name="message"
              placeholder="Any additional information for passengers"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>

          <button className="createbutton" type="submit">
            {loading
              ? isEdit
                ? "Saving...."
                : "Creating...."
              : isEdit
                ? "Save"
                : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}
