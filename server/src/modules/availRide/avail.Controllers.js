const createrideModel = require("../createRide/createRide.model");
async function availRide(req,res){
    try {
    const availrides = await createrideModel.find();

    if (availrides.length > 0) {
      res.status(200).json(availrides);
    } else {
      res.status(404).json({
        message: "No rides are currently available",
      });
    }
  }catch(err){
    return res.status(500).json({
      message: "Server Error",
    });

  }
}
module.exports = {availRide};