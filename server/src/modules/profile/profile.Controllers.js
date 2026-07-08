const userModel = require("../auth/auth.model");
const createrideModel = require("../createRide/createRide.model");

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

async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!name && !email) {
      return res
        .status(400)
        .json({ message: "Please provide name or email to update" });
    }

    if (email) {
      const existingUser = await userModel.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

async function getJoinedRides(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const joinedRides = await createrideModel
      .find({
        "bookingRequests.user": userId,
        "bookingRequests.status": "accepted",
      })
      .populate("createdBy", "name email gender");

    return res.status(200).json({ rides: joinedRides });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

module.exports = { getDetail, updateProfile, getJoinedRides };
