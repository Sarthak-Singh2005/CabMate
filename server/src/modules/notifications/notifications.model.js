const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "booking_request",
        "booking_accepted",
        "booking_rejected",
        "new_message",
      ],
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Notification", notificationSchema);
