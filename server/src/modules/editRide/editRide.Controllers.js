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
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        ride[field] = req.body[field];
      }
    });

    await ride.save();

    return res.status(200).json(ride);
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
