const mongoose = require("mongoose");

const createrideModel = new mongoose.Schema({
  createdBy:{
   type:mongoose.Schema.Types.ObjectId,
   ref:"User",
   required:true,
},

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
  bookingRequests: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
      createdAt: { type: Date, default: Date.now },
    },  
  ],
});

module.exports = mongoose.model("Ride", createrideModel);
