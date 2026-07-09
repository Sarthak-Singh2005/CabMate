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

    if (from && to && from.trim().toLowerCase() === to.trim().toLowerCase()) {
      return res.status(400).json({
        message: "Pickup and destination cannot be the same",
      });
    }

    if (vacantseat !== undefined && Number(vacantseat) < 1) {
      return res.status(400).json({
        message: "At least one seat must be available",
      });
    }

    if (cost !== undefined && Number(cost) <= 0) {
      return res.status(400).json({
        message: "Cost must be greater than 0",
      });
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        ride[field] = req.body[field];
      }
    });

    if (ride.status === "Full" && Number(ride.vacantseat) > 0) {
      ride.status = "Available";
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
