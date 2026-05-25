const mongoose = require("mongoose");

const createrideModel = new mongoose.Schema({
  from: {
    type: String,
    required: true,
  },

  to: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  phoneno: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  message: {
    type: String,
  },

  vehiclename: {
    type: String,
    required: true,
  },

  vacantseat: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Ride", createrideModel);
