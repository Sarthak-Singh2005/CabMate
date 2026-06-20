const Conversation = require("./conversation.model");
const { getIo } = require("../../socket");
const Message = require("./message.model");
const Ride = require("../createRide/createRide.model");

async function createConversation(req, res) {
  try {
    const { rideId } = req.body;
    const currentUser = req.user.id;
    console.log("Received rideId:", rideId);

    const ride = await Ride.findById(rideId);

    console.log("Ride found:", ride);
    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }
    const rideOwner = ride.createdBy.toString();
    let conversation = await Conversation.findOne({
      rideId,
      participants: {
        $all: [currentUser, rideOwner],
      },
    });
    console.log("Current User:", currentUser);
    console.log("Ride Owner:", rideOwner);
    if (!conversation) {
      conversation = await Conversation.create({
        rideId,
        participants: [currentUser, rideOwner],
      });
    }
    return res.status(200).json({
      conversation,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function getRideChats(req, res) {
  try {
    const { rideId } = req.params;

    const currentUser = req.user.id;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    if (ride.createdBy.toString() !== currentUser) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const conversations = await Conversation.find({
      rideId,
    }).populate("participants", "name email");
    if (conversations.length === 0) {
      return res.status(404).json({
        message: "No one have messaged you",
      });
    }
    return res.status(200).json({
      conversations,
      ownerId: currentUser,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function sendMessage(req, res) {
  try {
    const { conversationId, text } = req.body;

    const sender = req.user.id;
    let newMessage = await Message.create({ conversationId, sender, text });
    newMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "name _id",
    );
    const conversation =
      await Conversation.findById(conversationId).select("participants");
    const io = getIo();

    if (conversation && Array.isArray(conversation.participants)) {
      const receiver = conversation.participants.find(
        (participant) => participant.toString() !== sender.toString(),
      );
      if (receiver) {
        io.to(receiver.toString()).emit("notification", {
          type: "new_message",
          newMessage,
        });
      }
    }

    return res.status(201).json({
      newMessage,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({
      conversationId,
    }).populate("sender", "name");
    return res.status(200).json({
      messages,
      currentUser: req.user.id,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}

module.exports = { createConversation, sendMessage, getMessages, getRideChats };
