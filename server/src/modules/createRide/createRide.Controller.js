const createrideModel = require("./createRide.model");
async function createnewride(req, res) {
  const {
    to,
    from,
    time,
    phoneno,
    message,
    vehiclename,
    vacantseat,
    date,
    cost,
    maletravel,
    femaletravel
  } = req.body;
  try {
    if (
      !to ||
      !from ||
      !time ||
      !vehiclename ||
      !vacantseat ||
      !date ||
      !cost
    ) {
      return res.status(400).json({
        message: "Provide all the neccessary details",
      });
    }
    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      return res.status(400).json({
        message: "Pickup and destination cannot be the same",
      });
    }

    if (Number(vacantseat) < 1) {
      return res.status(400).json({
        message: "At least one seat must be available",
      });
    }

    if (Number(cost) < 0) {
      return res.status(400).json({
        message: "Cost cannot be negative",
      });
    }

    const ridecreate = await createrideModel.create({
      createdBy: req.user.id,
      to,
      date,
      cost,
      from,
      time,
      phoneno,
      message,
      vehiclename,
      vacantseat,
      femaletravel,
      maletravel,
    });
    return res.status(201).json({
      message: "Ride created successfully",
      ridecreate,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
module.exports = { createnewride };
