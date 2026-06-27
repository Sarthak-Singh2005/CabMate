const userModel = require("./auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Please provide email",
      });
    } else if (!password) {
      return res.status(400).json({
        message: "Please provide password",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Wrong email or password",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong email or password",
      });
    }
    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({
      message: "Login Successfully",
      user: {
        id: user._id,
        email: user.email,
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
    const { email, password, name } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Please provide email",
      });
    } else if (!password) {
      return res.status(400).json({
        message: "Please provide password",
      });
    } else if (!name) {
      return res.status(400).json({
        message: "Please provide name",
      });
    }
    const isUserAlreadyExists = await userModel.findOne({ email });
    if (isUserAlreadyExists) {
      return res.status(400).json({
        message: "Account already exist",
      });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      email,
      password: hash,
      name,
    });
    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
    });
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
    });
  }
}
module.exports = { loginUserController, registerUserController };
