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
    console.error("[getDetail]", error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, phone, gender } = req.body;
    const cleanedPhone = phone?.trim();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!name && !cleanedPhone && !gender) {
      return res
        .status(400)
        .json({ message: "Please provide profile details to update" });
    }

    if (gender && !["Male", "Female"].includes(gender)) {
      return res.status(400).json({ message: "Please select a valid gender" });
    }

    if (cleanedPhone && !/^[0-9]{10}$/.test(cleanedPhone)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid 10 digit phone number" });
    }

    if (cleanedPhone) {
      const existingUser = await userModel.findOne({
        phone: cleanedPhone,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Phone number already in use" });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (cleanedPhone) updateData.phone = cleanedPhone;
    if (gender) updateData.gender = gender;

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
    console.error("[updateProfile]", error);
    return res.status(500).json({ message: "Server error" });
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
      .populate("createdBy", "name phone gender")
      .populate("bookingRequests.user", "gender");

    return res.status(200).json({ rides: joinedRides });
  } catch (error) {
    console.error("[getJoinedRides]", error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getDetail, updateProfile, getJoinedRides };
