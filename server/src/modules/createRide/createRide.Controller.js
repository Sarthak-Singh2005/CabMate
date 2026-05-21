const createrideModel = require("./createRide.model");
async function createnewride(req, res) {
  const { to, from, name, time, phoneno, message, vehiclename, vacantseat } =
    req.body;
  try {
    if (!to || !from || !time || !vehiclename || !vacantseat) {
      return res.status(400).json({
        message: "Provide all the neccessary detail",
      });
    }
    const ridecreate = await createrideModel.create({
      to,
      from,
      time,
      phoneno,
      message,
      vehiclename,
      vacantseat,
    });
    return res.status(201).json({
      message: "Created Rides",
      ridecreate,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
module.exports = { createnewride };
