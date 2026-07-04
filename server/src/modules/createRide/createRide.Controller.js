const createrideModel = require("./createRide.model");
async function createnewride(req, res) {
  const { to, from, time, phoneno, message, vehiclename, vacantseat, date,cost} =req.body;
  try {
    if (!to || !from || !time || !vehiclename || !vacantseat|| !date|| !cost) {
      return res.status(400).json({
        message: "Provide all the neccessary details",
      });  
    }
    const ridecreate = await createrideModel.create({
      createdBy:req.user.id,
      to,
      date,
      cost,
      from,
      time,
      phoneno,
      message,
      vehiclename,
      vacantseat,
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
