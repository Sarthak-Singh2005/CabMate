const createrideModel = require("../createRide/createRide.model");
async function findride(req, res) {
  try {
    const { from, to, date } = req.body;
    let query = {};
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (from) {
      query.from = new RegExp(from, "i");
    }
    if (to) {
      query.to = new RegExp(to, "i");
    }
    if (date) {
      const requestedDate = new Date(date);
      requestedDate.setHours(0, 0, 0, 0);

      if (requestedDate < todayStart) {
        return res.status(404).json({
          message: "No rides available for your search.",
        });
      }

      query.date = date;
    }

    const availrides = await createrideModel
      .find({
        ...query,
        createdBy: { $ne: req.user.id },
        date: date ? query.date : { $gte: todayStart },
        vacantseat: { $gt: 0 },
        status: "Available",
      })
      .select("-phoneno")
      .populate("createdBy", "name gender")
      .populate("bookingRequests.user", "gender")
      .sort({ createdAt: -1 });

    if (availrides.length > 0) {
      return res.status(200).json({
        availride: availrides,
      });
    } else {
      return res.status(404).json({
        message: "No rides available for your search.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
module.exports = { findride };
