const createrideModel = require("../createRide/createRide.model");
const userModel = require("../auth/auth.model");
const Notification = require("../notifications/notifications.model");
const { getIo } = require("../../socket");
async function availRide(req, res) {
  try {
    const availrides = await createrideModel.find({
      createdBy: { $ne: req.user.id },
      vacantseat: { $gt: 0 },
    });

    if (availrides.length > 0) {
      return res.status(200).json(availrides);
    } else {
      return res.status(200).json({
        message: "No rides are currently available",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function ownerRide(req, res) {
  try {
    const ownerrides = await createrideModel.find({ createdBy: req.user.id });

    if (ownerrides.length > 0) {
      return res.status(200).json(ownerrides);
    } else {
      return res.status(200).json({
        message: "You haven't posted any rides yet",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function reqRide(req, res) {
  try {
    const { bookingreq, rideId } = req.body;
    if (!bookingreq || !rideId) {
      return res.status(400).json({ message: "Missing bookingreq or rideId" });
    }

    const updatedRide = await createrideModel.findOneAndUpdate(
      {
        _id: rideId,
        "bookingRequests.user": { $ne: req.user.id },
      },
      {
        $push: {
          bookingRequests: { user: req.user.id, status: "pending" },
        },
      },
      { returnDocument: "after" },
    );

    if (!updatedRide) {
      const ride = await createrideModel.findById(rideId);
      if (!ride) return res.status(404).json({ message: "Ride not found" });

      const existingRequest = ride.bookingRequests.find(
        (r) => r.user.toString() === req.user.id.toString(),
      );
      if (existingRequest) {
        if (existingRequest.status === "accepted") {
          return res.status(400).json({
            message: "Your request has already been accepted",
          });
        }

        if (existingRequest.status === "pending") {
          return res.status(400).json({
            message: "Your request is pending",
          });
        }

        if (existingRequest.status === "rejected") {
          return res.status(400).json({
            message: "Your request was rejected",
          });
        }
      }

      return res
        .status(500)
        .json({ message: "Unable to create booking request" });
    }

    const passenger = await userModel.findById(req.user.id);
    const ownerId = updatedRide.createdBy.toString();
    const passengerId = req.user.id.toString();

    console.log(`[reqRide] Passenger: ${passengerId}, Owner: ${ownerId}`);

    // Only send notification if passenger is not the owner (defensive check)
    if (passengerId !== ownerId && passenger) {
      const notificationMessage = `${passenger.name} requested a seat`;

      const io = getIo();

      // Log the notification being sent
      console.log(
        `[reqRide] Sending booking request notification to owner: ${ownerId}`,
      );

      const savedNotification = await Notification.create({
        user: ownerId,
        type: "booking_request",
        message: notificationMessage,
        ride: rideId,
      });

      io.to(ownerId).emit("notification", savedNotification.toObject());
    } else if (passengerId === ownerId) {
      console.log(
        `[reqRide] Passenger and owner are the same, skipping notification`,
      );
    }

    return res.status(200).json({
      message:
        "Booking request sent. You will be notified once the Owner Accept the request",
    });
  } catch (err) {
    console.error("[reqRide] Error:", err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}

async function getBookingRequests(req, res) {
  try {
    const { rideId } = req.params;

    if (!rideId || rideId === "undefined") {
      return res.status(400).json({
        message: "Ride id missing",
      });
    }

    const ride = await createrideModel
      .findById(rideId)
      .populate("bookingRequests.user", "name");
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    return res.status(200).json({ bookingRequests: ride.bookingRequests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
}
async function acceptRide(req, res) {
  try {
    const { rideId, passengerId } = req.body;
    if (!rideId || !passengerId)
      return res.status(400).json({ message: "Missing rideId or passengerId" });

    const ride = await createrideModel.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    const ownerId = ride.createdBy.toString();
    const currentUserId = req.user.id.toString();

    // Verify the owner is the one accepting
    if (ownerId !== currentUserId)
      return res.status(403).json({ message: "Not authorized" });

    const updatedRide = await createrideModel.findOneAndUpdate(
      {
        _id: rideId,

        createdBy: currentUserId,

        vacantseat: { $gt: 0 },

        bookingRequests: {
          $elemMatch: {
            user: passengerId,
            status: "pending",
          },
        },
      },

      {
        $inc: {
          vacantseat: -1,
        },

        $set: {
          "bookingRequests.$.status": "accepted",
        },
      },

      {
        returnDocument: "after",
      },
    );

    if (!updatedRide) {
      return res.status(400).json({
        message: "No seats available or request already processed",
      });
    }

    const io = getIo();
    const owner = await userModel.findById(ownerId);
    const ownerName = owner?.name || "Owner";

    // Convert passengerId to string for socket emission
    const passengerIdStr = passengerId.toString();

    // Send notification ONLY to the passenger
    console.log(
      `[acceptRide] Sending acceptance notification to passenger: ${passengerIdStr}`,
    );
    const savedNotification = await Notification.create({
      user: passengerIdStr,
      type: "booking_accepted",
      message: `${ownerName} accepted your booking`,
      ride: rideId,
    });

    io.to(passengerIdStr).emit("notification", savedNotification.toObject());

    return res.status(200).json({ message: "Request accepted" });
  } catch (err) {
    console.error("[acceptRide] Error:", err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function rejectRide(req, res) {
  try {
    const { rideId, passengerId } = req.body;
    if (!rideId || !passengerId) {
      return res.status(400).json({ message: "Missing rideId or passengerId" });
    }

    const ride = await createrideModel.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    const ownerId = ride.createdBy.toString();
    const currentUserId = req.user.id.toString();

    // Verify the owner is the one rejecting
    if (ownerId !== currentUserId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const request = ride.bookingRequests.find(
      (r) =>
        r.user.toString() === passengerId.toString() && r.status === "pending",
    );

    if (!request) {
      return res
        .status(404)
        .json({ message: "Pending booking request not found" });
    }

    request.status = "rejected";
    await ride.save();

    const io = getIo();
    const owner = await userModel.findById(ownerId);
    const ownerName = owner?.name || "Owner";

    // Convert passengerId to string for socket emission
    const passengerIdStr = passengerId.toString();

    // Send notification ONLY to the passenger
    console.log(
      `[rejectRide] Sending rejection notification to passenger: ${passengerIdStr}`,
    );
    const savedNotification = await Notification.create({
      user: passengerIdStr,
      type: "booking_rejected",
      message: `${ownerName} rejected your booking`,
      ride: rideId,
    });

    io.to(passengerIdStr).emit("notification", savedNotification.toObject());

    return res.status(200).json({ message: "Request rejected" });
  } catch (err) {
    console.error("[rejectRide] Error:", err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function cancelRide(req, res) {
  try {
    const { rideId } = req.params;
    const ride = await createrideModel.findOneAndUpdate(
      {_id: rideId},
      {
        $set: { status: "Cancelled Ride" },
      },
      {
        new: true,
      },
    );
    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }
    ride.status = "Cancelled Ride";
    return res.status(200).json({
      message: "Ride cancelled successfully",
      ride,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
module.exports = {
  availRide,
  ownerRide,
  reqRide,
  acceptRide,
  rejectRide,
  getBookingRequests,
  cancelRide,
};
