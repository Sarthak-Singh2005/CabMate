const Conversation = require("./conversation.model");
const { getIo } = require("../../socket");
const Message = require("./message.model");
const userModel = require("../auth/auth.model");
const Ride = require("../createRide/createRide.model");
const Notification = require("../notifications/notifications.model");
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
    const conversation = await Conversation.findById(conversationId).select(
      "participants rideId",
    );
    const io = getIo();

    if (
      conversation &&
      Array.isArray(conversation.participants) &&
      conversation.participants.length > 0
    ) {
      const senderStr = sender.toString();

      // Find the receiver - the other participant
      const receiver = conversation.participants.find(
        (participant) => participant.toString() !== senderStr,
      );

      if (receiver) {
        const receiverStr = receiver.toString();

        // Ensure sender and receiver are different
        if (senderStr !== receiverStr) {
          const senderUser = await userModel.findById(senderStr).select("name");
          const senderName = senderUser?.name || "User";
          const notificationMessage = `${senderName} sent you a message`;

          // Log for debugging
          console.log(
            `[sendMessage] Sender: ${senderStr}, Receiver: ${receiverStr}`,
          );
          console.log(
            `[sendMessage] Sending message notification to: ${receiverStr}`,
          );

          // Only emit notification to receiver, NOT to sender
          io.to(receiverStr).emit("notification", {
            type: "new_message",
            message: notificationMessage,
            newMessage,
          });

          // Only create notification for receiver, NOT for sender
          await Notification.create({
            user: receiverStr,
            type: "new_message",
            message: notificationMessage,
            ride: conversation.rideId,
          });
        } else {
          console.log(
            `[sendMessage] Sender and receiver are the same, skipping notification`,
          );
        }
      } else {
        console.log(`[sendMessage] No receiver found in conversation`);
      }
    } else {
      console.log(`[sendMessage] Invalid conversation or no participants`);
    }

    return res.status(201).json({
      newMessage,
    });
  } catch (err) {
    console.log("[sendMessage] Error:", err);
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
