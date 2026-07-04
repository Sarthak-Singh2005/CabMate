const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  conversationSchema.index({
    rideId: 1,
  }),
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Conversation", conversationSchema);
