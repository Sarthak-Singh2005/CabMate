const createrideModel = require("../createRide/createRide.model");

async function availRide(req, res) {
  try {
    const availrides = await createrideModel.find({
      createdBy: { $ne: req.user.id },
    });

    if (availrides.length > 0) {
      return res.status(200).json(availrides);
    } else {
      return res.status(200).json({ 
        message: "No rides are currently available" });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function ownerRide(req, res) {
  try {
    const ownerrides = await createrideModel.find({ createdBy: req.user.id });

    if (ownerrides.length > 0) {
      return res.status(200).json(ownerrides);
    } else {
      return res.status(200).json({
        message: "You haven't posted any rides yet",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function reqRide(req, res) {
  try {
    const bookingreq = req.body;
    console.log(bookingreq);
    if (bookingreq) {
      return res.status(200).json({ acceptreq: "yes" });
    } else {
      return res.status(200).json({
        acceptreq: "no",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function acceptRide(req, res) {
  try {
    const acceptreq = req.body;
    console.log("accq31", acceptreq);
    if (acceptreq) {
      return res.status(200).json({ acceptreq: true });
    } else {
      return res.status(200).json({ acceptreq: false });
    }
  } catch (err) { 
    console.error(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}

module.exports = { availRide, ownerRide,reqRide,acceptRide };
