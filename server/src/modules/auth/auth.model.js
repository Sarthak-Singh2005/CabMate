const mongoose = require("mongoose");
const userModel = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: [true, "Already Exist with this Email Account"],
    },
    password: {
      type: String,
      required: true,
    },
    name:{
      type:String,
      required:true,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("User", userModel);
