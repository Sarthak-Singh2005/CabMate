const mongoose = require("mongoose");

const createrideModel = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    date: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
    },
    status:{
      type: String,
      enum:["Available","Completed","Cancelled","Full"],
      default: "Available",
    },
    vehiclename: {
      type: String,
      required: true,
    },

    vacantseat: {
      type: Number,
      required: true,
    },
    maletravel: {
      type: Number,
    },
    femaletravel: {
      type: Number,
    },
    bookingRequests: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Ride", createrideModel);
