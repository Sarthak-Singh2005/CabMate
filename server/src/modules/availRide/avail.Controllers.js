const createrideModel = require("../createRide/createRide.model");

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

    return res.status(200).json({
      message:
        "Booking request sent. You will be notified once the Owner Accept the request",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}

async function getBookingRequests(req, res) {
  try {
    const { rideId } = req.params;
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
    if (ride.createdBy.toString() !== req.user.id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const reqIndex = ride.bookingRequests.findIndex(
      (r) =>
        r.user.toString() === passengerId.toString() && r.status === "pending",
    );
    if (reqIndex === -1)
      return res.status(404).json({ message: "Pending request not found" });
    if (ride.vacantseat <= 0) {
      ride.bookingRequests[reqIndex].status = "accepted";
      await ride.save();
      return res.status(400).json({
        message: "No seats left in the vehicle",
      });
    }
    ride.bookingRequests[reqIndex].status = "accepted";
    ride.vacantseat -= 1;
    await ride.save();
    return res.status(200).json({ message: "Request accepted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function rejectRide(req, res) {
  try {
    const { rideId, passengerId } = req.body;
    if (!rideId || !passengerId) {
      return res.status(404).json({ message: "rideId or passengerNot Found" });
    }
    const ride = await createrideModel.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride Not Found" });
    } else {
      const request = ride.bookingRequests.find(
        (r) =>
          r.user.toString() === passengerId.toString() &&
          r.status === "pending",
      );
      if (request) {
        request.status = "rejected";
        await ride.save();
        return res.status(200).json({ message: "Request rejected" });
      }
    }
  } catch (er) {
    return res.status(500).json({
      message: "Server Error",
    });
    console.log(err);
  }
}

module.exports = {
  availRide,
  ownerRide,
  reqRide,
  acceptRide,
  rejectRide,
  getBookingRequests,
};
