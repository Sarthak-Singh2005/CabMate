const createrideModel =require("../createRide/createRide.model");
async function findride(req, res) {
  try {
    const { from, to, date } = req.body;
    let query = {};
    if(from){
      query.from = new RegExp(from, "i");
    }
    if(to){
      query.to = new RegExp(to, "i");
    }
    if(date){
      query.date = date;
    }
    const availrides =await createrideModel.find(query);
    if(availrides.length > 0){
      return res.status(200).json({
        availride: availrides,
      });
    } else {
      return res.status(404).json({
        message:"No rides available for your search.",
      });
    }
  } catch(err){
    console.log(err);
    return res.status(500).json({
      message:"Server Error",
    });
  }
}
module.exports = { findride };