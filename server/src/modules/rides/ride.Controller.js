const rideModel = require("../createRide/createRide.model");
async function findRides(req, res) {
  try {
    const { to, from } = req.body;
    if (!to || !from) {
      return res.status(400).json({
        message: "Please provide from and to location",
      });
    }
    const availride = await rideModel.find({ to, from });
    if (availride.length == 0) {
      return res.status(400).json({
        message: "Rides not Available.You can create a new.",
      });
    } else {
      return res.send({ availride });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
module.exports ={findRides};