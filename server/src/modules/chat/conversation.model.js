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

    type: {
      type: String,
      enum: ["direct", "ride_group"],
      default: "direct",
    },

    groupName: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({
  rideId: 1,
});

conversationSchema.index(
  { rideId: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "ride_group" } },
);

module.exports = mongoose.model("Conversation", conversationSchema);
