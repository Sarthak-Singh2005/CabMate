const Conversation = require("./conversation.model");
const { getIo } = require("../../socket");
const Message = require("./message.model");
const userModel = require("../auth/auth.model");
const Ride = require("../createRide/createRide.model");
const { sendNotification } = require("../notifications/notification.service");
async function createConversation(req, res) {
  try {
    const { rideId } = req.body;
    const currentUser = req.user.id;
    const ride = await Ride.findById(rideId).select("createdBy");

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
    console.error("[createConversation]", err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function getRideChats(req, res) {
  try {
    const { rideId } = req.params;

    const currentUser = req.user.id;
    if (!rideId || rideId === "undefined") {
      return res.status(400).json({
        message: "Ride id missing",
      });
    }
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
    }).populate("participants", "name phone");
    if (conversations.length === 0) {
      return res.status(200).json({
        message: "No one have messaged you",
      });
    }
    return res.status(200).json({
      conversations,
      ownerId: currentUser,
    });
  } catch (err) {
    console.error("[getRideChats]", err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function sendMessage(req, res) {
  try {
    const { conversationId, text } = req.body;
    const sender = req.user.id;

    const conversation = await Conversation.findById(conversationId).select(
      "participants rideId",
    );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const senderStr = sender.toString();

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === senderStr,
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const cleanedText = text?.trim();

    if (!cleanedText) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    let newMessage = await Message.create({
      conversationId,
      sender,
      text: cleanedText,
    });

    newMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "name _id",
    );

    const receiver = conversation.participants.find(
      (participant) => participant.toString() !== senderStr,
    );

    if (receiver) {
      const receiverStr = receiver.toString();

      const io = getIo();

      io.to(receiverStr).emit("chat:message", newMessage);

      const notificationMessage = `${newMessage.sender.name} sent you a message`;

      await sendNotification({
        user: receiverStr,
        type: "new_message",
        message: notificationMessage,
        ride: conversation.rideId,
        conversation: conversation._id,
      });
    }

    return res.status(201).json({
      newMessage,
    });
  } catch (err) {
    console.error("[sendMessage]", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === req.user.id.toString(),
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const messages = await Message.find({
      conversationId,
    }).populate("sender", "name");

    return res.status(200).json({
      messages,
      currentUser: req.user.id,
    });
  } catch (err) {
    console.error("[getMessages]", err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}

module.exports = { createConversation, sendMessage, getMessages, getRideChats };
