const userModel = require("./auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };
}

async function loginUserController(req, res) {
  try {
    const { phone, password } = req.body;
    const cleanedPhone = phone?.trim();
    if (!cleanedPhone) {
      return res.status(400).json({
        message: "Please provide phone number",
      });
    } else if (!password) {
      return res.status(400).json({
        message: "Please provide password",
      });
    } else if (!/^[0-9]{10}$/.test(cleanedPhone)) {
      return res.status(400).json({
        message: "Please provide a valid 10 digit phone number",
      });
    }
    const user = await userModel.findOne({ phone: cleanedPhone });
    if (!user) {
      return res.status(400).json({
        message: "Wrong phone number or password",
      });
    }
    if (!user.password) {
      return res.status(400).json({
        message: "This account does not have a password login.",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong phone number or password",
      });
    }
    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
    res.cookie("token", token, getAuthCookieOptions());
    res.status(200).json({
      message: "Login Successfully",
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function registerUserController(req, res) {
  try {
    const { phone, password, name, gender } = req.body;
    const cleanedPhone = phone?.trim();
    if (!cleanedPhone) {
      return res.status(400).json({
        message: "Please provide phone number",
      });
    } else if (!password) {
      return res.status(400).json({
        message: "Please provide password",
      });
    } else if (!name) {
      return res.status(400).json({
        message: "Please provide name",
      });
    } else if (!gender) {
      return res.status(400).json({
        message: "Please select gender",
      });
    } else if (!["Male", "Female"].includes(gender)) {
      return res.status(400).json({
        message: "Please select a valid gender",
      });
    } else if (!/^[0-9]{10}$/.test(cleanedPhone)) {
      return res.status(400).json({
        message: "Please provide a valid 10 digit phone number",
      });
    }
    const isUserAlreadyExists = await userModel.findOne({
      phone: cleanedPhone,
    });
    if (isUserAlreadyExists) {
      return res.status(400).json({
        message: "Account already exist",
      });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      phone: cleanedPhone,
      password: hash,
      name,
      gender,
    });
    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
    res.cookie("token", token, getAuthCookieOptions());
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        phone: user.phone,
        gender: user.gender,
        name: user.name,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
    });
  }
}

async function logoutUserController(req, res) {
  try {
    res.clearCookie("token", getAuthCookieOptions());

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
}

async function changePasswordController(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      return res
        .status(400)
        .json({ message: "Please provide current password" });
    }
    if (!newPassword) {
      return res.status(400).json({ message: "Please provide a new password" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function forgotPasswordController(req, res) {
  try {
    const { phone } = req.body;
    const cleanedPhone = phone?.trim();
    if (!cleanedPhone) {
      return res.status(400).json({ message: "Please provide phone number" });
    }
    const user = await userModel.findOne({ phone: cleanedPhone });
    if (!user) {
      return res.status(404).json({ message: "Phone number not registered" });
    }

    return res.status(200).json({
      message:
        "If this phone number is registered, password reset can continue.",
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

async function getCurrentUserController(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        phone: user.phone,
        gender: user.gender,
        name: user.name,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

module.exports = {
  loginUserController,
  registerUserController,
  logoutUserController,
  changePasswordController,
  forgotPasswordController,
  getCurrentUserController,
};
