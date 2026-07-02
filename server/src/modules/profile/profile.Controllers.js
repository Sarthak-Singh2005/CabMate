const userModel = require("../auth/auth.model");
async function getDetail(req, res) {

    try {
    const personId = req.params.profileId || req.user?.id;

    if (!personId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const person = await userModel.findById(personId).select("-password");

    if (!person) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user: person });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

module.exports = { getDetail };
