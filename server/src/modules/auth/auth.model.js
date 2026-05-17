const mongoose = require("mongoose");
const userModel = new mongoose.Schema(
  {
    email: {
      type: String,
      require: true,
      unique: [true, "Already Exist with this Email Account"],
    },
    password: {
      type: String,
      require: true,
    },
    name:{
      type:String,
      require:true,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("User", userModel);
