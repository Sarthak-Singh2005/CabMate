const createrideModel = require("../createRide/createRide.model");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findride(req, res) {
  try {
    const { from, to, date } = req.body;
    let query = {};
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (from && typeof from !== "string") {
      return res.status(400).json({ message: "Invalid pickup location" });
    }
    if (to && typeof to !== "string") {
      return res.status(400).json({ message: "Invalid destination" });
    }
    if (from?.trim()) {
      query.from = new RegExp(escapeRegex(from.trim().slice(0, 100)), "i");
    }
    if (to?.trim()) {
      query.to = new RegExp(escapeRegex(to.trim().slice(0, 100)), "i");
    }
    if (date) {
      if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: "Invalid ride date" });
      }
      const requestedDate = new Date(date);
      if (Number.isNaN(requestedDate.getTime())) {
        return res.status(400).json({ message: "Invalid ride date" });
      }
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
      .sort({ createdAt: -1 })
      .limit(50);

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
