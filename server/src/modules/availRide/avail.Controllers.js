const createrideModel = require("../createRide/createRide.model");
const userModel = require("../auth/auth.model");
const { getIo } = require("../../socket");
const { sendNotification } = require("../notifications/notification.service");
async function availRide(req, res) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const availrides = await createrideModel
      .find({
        createdBy: { $ne: req.user.id },
        date: { $gte: todayStart },
        vacantseat: { $gt: 0 },
        status: "Available",
      })
      .select("-phoneno")
      .populate("createdBy", "name gender")
      .populate("bookingRequests.user", "gender")
      .sort({ createdAt: -1 });

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
    const ownerrides = await createrideModel
      .find({ createdBy: req.user.id })
      .select("-phoneno")
      .populate("createdBy", "name gender")
      .populate("bookingRequests.user", "gender")
      .sort({ createdAt: -1 });

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
    const ride = await createrideModel
      .findById(rideId)
      .select("createdBy date status vacantseat");

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const rideDate = new Date(ride.date);
    rideDate.setHours(0, 0, 0, 0);

    if (
      ride.status !== "Available" ||
      Number(ride.vacantseat) <= 0 ||
      rideDate < todayStart
    ) {
      return res.status(400).json({
        message: "This ride is no longer available",
      });
    }

    if (ride.createdBy.toString() === req.user.id.toString()) {
      return res.status(400).json({
        message: "You cannot request your own ride",
      });
    }
    const updatedRide = await createrideModel.findOneAndUpdate(
      {
        _id: rideId,
        status: "Available",
        vacantseat: { $gt: 0 },
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

    if (passenger) {
      const notificationMessage = `${passenger.name} requested a seat`;

      await sendNotification({
        user: ownerId,
        type: "booking_request",
        message: notificationMessage,
        ride: rideId,
        passenger: req.user.id,
      });
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
      .populate("bookingRequests.user", "name gender"); // <-- add gender
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }
    return res.status(200).json({ bookingRequests: ride.bookingRequests });
  } catch (err) {
    console.error("[getBookingRequests]", err);
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

    if (ownerId !== currentUserId)
      return res.status(403).json({ message: "Not authorized" });

    const updatedRide = await createrideModel.findOneAndUpdate(
      {
        _id: rideId,

        createdBy: currentUserId,

        status: "Available",

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

    if (Number(updatedRide.vacantseat) === 0) {
      updatedRide.status = "Full";
      await updatedRide.save();
    }

    const owner = await userModel.findById(ownerId).select("name");
    const ownerName = owner?.name || "Owner";

    const passengerIdStr = passengerId.toString();

    await sendNotification({
      user: passengerIdStr,
      type: "booking_accepted",
      message: `${ownerName} accepted your booking`,
      ride: rideId,
    });

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
    const owner = await userModel.findById(ownerId).select("name");
    const ownerName = owner?.name || "Owner";

    const passengerIdStr = passengerId.toString();

    await sendNotification({
      user: passengerIdStr,
      type: "booking_rejected",
      message: `${ownerName} rejected your booking`,
      ride: rideId,
    });
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

    if (!rideId) {
      return res.status(400).json({
        message: "Missing rideId",
      });
    }

    const ride = await createrideModel.findOneAndUpdate(
      {
        _id: rideId,
        createdBy: req.user.id,
        status: {
          $ne: "Cancelled",
        },
      },
      {
        $set: {
          status: "Cancelled",
        },
      },
      {
        new: true,
      },
    );

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found or you are not authorized to cancel this ride",
      });
    }

    const owner = await userModel.findById(ride.createdBy).select("name");
    const ownerName = owner?.name || "Owner";

    for (const booking of ride.bookingRequests) {
      if (booking.status !== "accepted" && booking.status !== "pending") {
        continue;
      }

      await sendNotification({
        user: booking.user,
        type: "cancel_ride",
        message: `${ownerName} cancelled the ride from ${ride.from} to ${ride.to}`,
        ride: ride._id,
      });
    }

    return res.status(200).json({
      message: "Ride cancelled successfully",
      ride,
    });
  } catch (err) {
    console.error("[cancelRide]", err);

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
