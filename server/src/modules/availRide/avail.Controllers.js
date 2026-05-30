const createrideModel = require("../createRide/createRide.model");

async function availRide(req, res) {
  try {
    const availrides = await createrideModel.find({
      createdBy: { $ne: req.user.id },
    });

    if (availrides.length > 0) {
      return res.status(200).json(availrides);
    }

    return res.status(404).json({
      message: "No rides are currently available",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function ownerRide(req, res) {
  try {
    const availrides = await createrideModel.find({createdBy: req.user.id});

    if (availrides.length > 0) {
      return res.status(200).json(availrides);
    }

    return res.status(404).json({
      message: "You haven't posted any rides yet",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
}

module.exports = { availRide, ownerRide };
