const createrideModel = require("../createRide/createRide.model");

async function editRide(req, res) {
  try {
    const { id1 } = req.params;

    const ride = await createrideModel.findById(id1);

    if (!ride) {
      return res.status(404).json({
        message: "Ride Not Found",
      });
    }

    if (ride.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const { from, to, cost, vacantseat } = req.body;

    const allowedFields = [
      "from",
      "to",
      "date",
      "time",
      "cost",
      "phoneno",
      "message",
      "vehiclename",
      "vacantseat",
      "maletravel",
      "femaletravel",
    ];
    const acceptedPassengers = ride.bookingRequests.filter(
      (request) => request.status === "accepted",
    ).length;
    const tripFields = [
      "from",
      "to",
      "date",
      "time",
      "cost",
      "phoneno",
      "vehiclename",
      "vacantseat",
      "maletravel",
      "femaletravel",
    ];

    if (
      acceptedPassengers > 0 &&
      tripFields.some((field) => req.body[field] !== undefined)
    ) {
      return res.status(409).json({
        message: "Trip details cannot be changed after passengers are accepted",
      });
    }

    const nextFrom = from === undefined ? ride.from : from;
    const nextTo = to === undefined ? ride.to : to;
    if (
      typeof nextFrom !== "string" ||
      typeof nextTo !== "string" ||
      !nextFrom.trim() ||
      !nextTo.trim() ||
      nextFrom.trim().toLowerCase() === nextTo.trim().toLowerCase()
    ) {
      return res.status(400).json({
        message: "Pickup and destination cannot be the same",
      });
    }

    if (cost !== undefined && (!Number.isFinite(Number(cost)) || Number(cost) <= 0)) {
      return res.status(400).json({
        message: "Cost must be a positive number",
      });
    }

    if (
      vacantseat !== undefined &&
      (!Number.isInteger(Number(vacantseat)) || Number(vacantseat) < 0)
    ) {
      return res.status(400).json({
        message: "Available seats must be a non-negative whole number",
      });
    }

    for (const field of ["maletravel", "femaletravel"]) {
      const value = req.body[field];
      if (value !== undefined && (!Number.isInteger(Number(value)) || Number(value) < 0)) {
        return res.status(400).json({
          message: "Passenger counts must be non-negative whole numbers",
        });
      }
    }

    if (req.body.time !== undefined && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(req.body.time)) {
      return res.status(400).json({
        message: "Please provide a valid time",
      });
    }

    if (req.body.date !== undefined) {
      const dateMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(req.body.date);
      if (!dateMatch) {
        return res.status(400).json({ message: "Please provide a valid date" });
      }
      const [, year, month, day] = dateMatch;
      const requestedDate = new Date(Number(year), Number(month) - 1, Number(day));
      if (
        requestedDate.getFullYear() !== Number(year) ||
        requestedDate.getMonth() !== Number(month) - 1 ||
        requestedDate.getDate() !== Number(day)
      ) {
        return res.status(400).json({ message: "Please provide a valid date" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (requestedDate < today) {
        return res.status(400).json({ message: "Ride date must be today or later" });
      }

      const updatedTime = req.body.time || ride.time;
      if (requestedDate.getTime() === today.getTime()) {
        const [hours, minutes] = updatedTime.split(":").map(Number);
        if (hours * 60 + minutes <= today.getHours() * 60 + today.getMinutes()) {
          return res.status(400).json({ message: "Ride time must be in the future" });
        }
      }
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        ride[field] = req.body[field];
      }
    });

    if (ride.status === "Full" && Number(ride.vacantseat) > 0) {
      ride.status = "Available";
    } else if (Number(ride.vacantseat) === 0 && ride.status === "Available") {
      ride.status = "Full";
    }

    await ride.save();

    return res.status(200).json({
      message: "Ride updated successfully",
      ride,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function fetchforEdit(req, res) {
  try {
    const { id1 } = req.params;

    const ride = await createrideModel.findById(id1);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    if (ride.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    return res.status(200).json(ride);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  editRide,
  fetchforEdit,
};
