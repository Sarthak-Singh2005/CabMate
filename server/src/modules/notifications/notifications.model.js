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
        "cancel_ride",
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

    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Notification", notificationSchema);
