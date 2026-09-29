const userModel = require("../auth/auth.model");
const createrideModel = require("../createRide/createRide.model");

async function getDetail(req, res) {
  try {
    const personId = req.params.profileId || req.user?.id;

    if (!personId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isSelf = personId.toString() === req.user.id.toString();
    const person = await userModel
      .findById(personId)
      .select(isSelf ? "name phone gender createdAt" : "name gender createdAt");

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

    const query = {
      bookingRequests: { $elemMatch: { user: userId, status: "accepted" } },
    };
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const [joinedRides, total] = await Promise.all([
      createrideModel
        .find(query)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
      .populate("createdBy", "name phone gender")
        .populate("bookingRequests.user", "gender"),
      createrideModel.countDocuments(query),
    ]);

    return res.status(200).json({
      rides: joinedRides,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[getJoinedRides]", error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getDetail, updateProfile, getJoinedRides };
