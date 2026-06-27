const createrideModel = require("../createRide/createRide.model");
async function editRide(req, res) {
  try {
    const { id1 } = req.params;
    const info = req.body;
    const user = await createrideModel.findById(id1);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    for (const key in info) {
      user[key] = info[key];
    }
    await user.save();
    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
async function fetchforEdit(req, res) {
  try {
    const { id1 } = req.params;

    const data = await createrideModel.findById(id1);

    if (!data) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  editRide,
  fetchforEdit,
};
