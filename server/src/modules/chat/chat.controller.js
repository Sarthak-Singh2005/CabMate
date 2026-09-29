const mongoose = require("mongoose");
const crypto = require("crypto");
const { createReadStream } = require("node:fs");
const { unlink } = require("node:fs/promises");
const { Readable } = require("node:stream");
const { pipeline } = require("node:stream/promises");

const Conversation = require("./conversation.model");
const { getIo } = require("../../socket");
const Message = require("./message.model");
const Ride = require("../createRide/createRide.model");
const { sendNotification } = require("../notifications/notification.service");
const { validateAttachment } = require("./attachment.util");
const cloudinary = require("../../config/cloudinary");

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

const isRideMember = (ride, userId) => {
  const userIdString = userId.toString();

  return (
    ride.createdBy.toString() === userIdString ||
    ride.bookingRequests.some(
      (request) =>
        request.status === "accepted" &&
        request.user.toString() === userIdString
    )
  );
};

async function isCurrentRideMember(rideId, userId) {
  const ride = await Ride.findById(rideId).select(
    "createdBy bookingRequests"
  );

  return Boolean(ride && isRideMember(ride, userId));
}

// Upload a temporary file to Cloudinary without buffering it in memory.
// Images -> image resource type
// PDFs   -> raw resource type
function uploadFileToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const isPdf = file.mimetype === "application/pdf";

    const resourceType = isPdf ? "raw" : "image";

    // No slash in the public_id because your current route
    // uses /attachments/:filename
    const publicId = `chat_${crypto.randomUUID()}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        type: "authenticated",
        public_id: publicId,
        use_filename: false,
        unique_filename: false,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ publicId, resourceType, result });
      },
    );

    pipeline(createReadStream(file.path), uploadStream).catch(reject);
  });
}

// Delete an uploaded Cloudinary object.
// Used for cleanup if message creation fails.
async function deleteCloudinaryFile(publicId, resourceType) {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type: "authenticated",
      invalidate: true,
    });
  } catch (error) {
    console.error(
      `[Cloudinary] Failed to delete ${publicId}`,
      error
    );
  }
}

// ---------------------------------------------------------
// Ride group
// ---------------------------------------------------------

async function createRideGroup(req, res) {
  try {
    const { rideId } = req.params;
    const ownerId = req.user.id.toString();
    const { groupName, passengerIds } = req.body;

    const ride = await Ride.findById(rideId).select(
      "createdBy bookingRequests"
    );

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    if (ride.createdBy.toString() !== ownerId) {
      return res.status(403).json({
        message: "Only the ride owner can create this group",
      });
    }

    const acceptedPassengerIds = ride.bookingRequests
      .filter((request) => request.status === "accepted")
      .map((request) => request.user.toString());

    if (!acceptedPassengerIds.length) {
      return res.status(400).json({
        message: "Accept at least one passenger before creating a ride group",
      });
    }

    if (!Array.isArray(passengerIds)) {
      return res.status(400).json({
        message: "Select group members",
      });
    }

    const selectedPassengerIds = [...new Set(passengerIds)].map(String);

    const hasOnlyAcceptedPassengers = selectedPassengerIds.every(
      (passengerId) => acceptedPassengerIds.includes(passengerId)
    );

    if (!selectedPassengerIds.length || !hasOnlyAcceptedPassengers) {
      return res.status(400).json({
        message: "Select at least one accepted passenger for the group",
      });
    }

    const cleanedGroupName = groupName?.trim();

    if (!cleanedGroupName) {
      return res.status(400).json({
        message: "Enter a group name",
      });
    }

    let conversation = await Conversation.findOne({
      rideId,
      type: "ride_group",
    });

    if (!conversation) {
      conversation = await Conversation.create({
        rideId,
        type: "ride_group",
        groupName: cleanedGroupName,
        createdBy: ownerId,
        participants: [ownerId, ...selectedPassengerIds],
      });
    }

    return res.status(200).json({ conversation });
  } catch (err) {
    if (err?.code === 11000) {
      const conversation = await Conversation.findOne({
        rideId: req.params.rideId,
        type: "ride_group",
      });

      return res.status(200).json({ conversation });
    }

    console.error("[createRideGroup]", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
}

async function getRideGroup(req, res) {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId).select(
      "createdBy bookingRequests"
    );

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    const conversation = await Conversation.findOne({
      rideId,
      type: "ride_group",
    });

    if (!conversation) {
      return res.status(404).json({
        message: "The ride owner has not created a group yet",
      });
    }

    const isParticipant = conversation.participants.some(
      (participant) =>
        participant.toString() === req.user.id.toString()
    );

    if (!isParticipant || !isRideMember(ride, req.user.id)) {
      return res.status(403).json({
        message: "Not authorized to access this ride group",
      });
    }

    return res.status(200).json({ conversation });
  } catch (err) {
    console.error("[getRideGroup]", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
}

async function updateRideGroup(req, res) {
  try {
    const { conversationId } = req.params;
    const { groupName, passengerIds } = req.body;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation || conversation.type !== "ride_group") {
      return res.status(404).json({
        message: "Ride group not found",
      });
    }

    const ride = await Ride.findById(conversation.rideId).select(
      "createdBy bookingRequests"
    );

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    if (ride.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Only the ride owner can manage this group",
      });
    }

    if (!Array.isArray(passengerIds)) {
      return res.status(400).json({
        message: "Select group members",
      });
    }

    const selectedPassengerIds = [...new Set(passengerIds)].map(String);

    const acceptedPassengerIds = ride.bookingRequests
      .filter((request) => request.status === "accepted")
      .map((request) => request.user.toString());

    if (
      !selectedPassengerIds.length ||
      !selectedPassengerIds.every((passengerId) =>
        acceptedPassengerIds.includes(passengerId)
      )
    ) {
      return res.status(400).json({
        message: "Select at least one accepted passenger for the group",
      });
    }

    const cleanedGroupName = groupName?.trim();

    if (!cleanedGroupName) {
      return res.status(400).json({
        message: "Enter a group name",
      });
    }

    conversation.groupName = cleanedGroupName;
    conversation.createdBy = ride.createdBy;
    conversation.participants = [
      ride.createdBy,
      ...selectedPassengerIds,
    ];

    await conversation.save();

    return res.status(200).json({ conversation });
  } catch (err) {
    console.error("[updateRideGroup]", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
}

// ---------------------------------------------------------
// 1-to-1 conversation
// ---------------------------------------------------------

async function createConversation(req, res) {
  try {
    const { rideId, passengerId } = req.body;
    const currentUser = req.user.id;

    const ride = await Ride.findById(rideId).select(
      "createdBy bookingRequests"
    );

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    const rideOwner = ride.createdBy.toString();
    let chatPartner;

    if (rideOwner === currentUser.toString()) {
      const acceptedPassenger = ride.bookingRequests.find(
        (request) =>
          request.status === "accepted" &&
          request.user.toString() === String(passengerId),
      );

      if (!acceptedPassenger) {
        return res.status(400).json({
          message: "Select an accepted passenger to start this chat",
        });
      }

      chatPartner = acceptedPassenger.user.toString();
    } else {
      if (passengerId) {
        return res.status(403).json({
          message: "Only the ride owner can choose a passenger for this chat",
        });
      }

      if (!isRideMember(ride, currentUser)) {
        return res.status(403).json({
          message:
            "Only the ride owner and accepted passengers can start this chat",
        });
      }

      chatPartner = rideOwner;
    }

    let conversation = await Conversation.findOne({
      rideId,
      type: { $ne: "ride_group" },
      participants: {
        $all: [currentUser, chatPartner],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        rideId,
        participants: [currentUser, chatPartner],
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

// ---------------------------------------------------------
// Ride chats
// ---------------------------------------------------------

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

    const acceptedMemberIds = new Set([
      ride.createdBy.toString(),
      ...ride.bookingRequests
        .filter((request) => request.status === "accepted")
        .map((request) => request.user.toString()),
    ]);

    const conversations = await Conversation.find({
      rideId,
      type: { $ne: "ride_group" },
    })
      .populate("participants", "name phone")
      .sort({ updatedAt: -1 })
      .limit(100);

    const eligibleConversations = conversations.filter(
      (conversation) =>
        conversation.participants.every((participant) =>
          acceptedMemberIds.has(participant._id.toString())
        )
    );

    if (eligibleConversations.length === 0) {
      return res.status(200).json({
        message: "No one have messaged you",
      });
    }

    return res.status(200).json({
      conversations: eligibleConversations,
      ownerId: currentUser,
    });
  } catch (err) {
    console.error("[getRideChats]", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
}

// ---------------------------------------------------------
// Send message
// ---------------------------------------------------------

async function sendMessage(req, res) {
  const uploadedCloudinaryFiles = [];

  try {
    const { conversationId, text } = req.body;
    const sender = req.user.id;

    const uploadedFiles = Array.isArray(req.files)
      ? req.files
      : [];

    console.log(
      `[Chat] sendMessage - Uploaded files count: ${uploadedFiles.length}`
    );

    // -----------------------------------------------
    // 1. Validate conversation FIRST
    // -----------------------------------------------

    const conversation = await Conversation.findById(
      conversationId
    ).select("participants rideId type");

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const senderStr = sender.toString();

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === senderStr
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (
      !(await isCurrentRideMember(
        conversation.rideId,
        sender
      ))
    ) {
      return res.status(403).json({
        message:
          "You are no longer a member of this ride",
      });
    }

    // -----------------------------------------------
    // 2. Validate text
    // -----------------------------------------------

    const cleanedText =
      typeof text === "string" ? text.trim() : "";

    if (!cleanedText && uploadedFiles.length === 0) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    // -----------------------------------------------
    // 3. Validate files BEFORE uploading
    // -----------------------------------------------

    const validatedFiles = uploadedFiles.map((file) => {
      const attachment = {
        // Temporary URL used for validation.
        // It will be replaced after Cloudinary upload.
        url: "/api/chat/attachments/pending",
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      };

      const result = validateAttachment(attachment);

      if (!result.valid) {
        throw new Error(result.message);
      }

      return file;
    });

    // -----------------------------------------------
    // 4. Upload files to Cloudinary
    // -----------------------------------------------

    const attachments = [];

    for (const file of validatedFiles) {
      const uploaded = await uploadFileToCloudinary(
        file
      );

      uploadedCloudinaryFiles.push(uploaded);

      attachments.push({
        // Keep using your existing URL-based schema.
        // The filename is the Cloudinary public_id.
        url: `/api/chat/attachments/${encodeURIComponent(
          uploaded.publicId
        )}`,

        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
    }

    // -----------------------------------------------
    // 5. Validate final attachment metadata
    // -----------------------------------------------

    const validatedAttachments = attachments.map(
      (attachment) => {
        const result = validateAttachment(attachment);

        if (!result.valid) {
          throw new Error(result.message);
        }

        return attachment;
      }
    );

    // -----------------------------------------------
    // 6. Create MongoDB message
    // -----------------------------------------------

    let newMessage = await Message.create({
      conversationId,
      sender,
      text: cleanedText,
      attachments: validatedAttachments,
    });

    newMessage = await Message.findById(
      newMessage._id
    ).populate("sender", "name _id");

    // -----------------------------------------------
    // 7. Notify recipients
    // -----------------------------------------------

    const recipients = conversation.participants.filter(
      (participant) =>
        participant.toString() !== senderStr
    );

    const io = getIo();

    const notificationMessage =
      validatedAttachments.length
        ? `${newMessage.sender.name} sent you a file`
        : `${newMessage.sender.name} sent you a message`;

    for (const recipient of recipients) {
      const recipientId = recipient.toString();

      io.to(recipientId).emit(
        "chat:message",
        newMessage
      );

      await sendNotification({
        user: recipientId,
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

    // -------------------------------------------------
    // Cleanup Cloudinary uploads if anything failed
    // -------------------------------------------------

    if (uploadedCloudinaryFiles.length) {
      await Promise.all(
        uploadedCloudinaryFiles.map((file) =>
          deleteCloudinaryFile(
            file.publicId,
            file.resourceType
          )
        )
      );
    }

    if (
      err?.message ===
        "Only JPG, PNG, WEBP, GIF, and PDF files are allowed." ||
      err?.message ===
        "Attachment details are incomplete." ||
      err?.message ===
        "Attachment is required."
    ) {
      return res.status(400).json({
        message: err.message,
      });
    }

    return res.status(500).json({
      message: "Server Error",
    });
  } finally {
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    await Promise.all(
      uploadedFiles.map((file) =>
        unlink(file.path).catch((err) => {
          if (err.code !== "ENOENT") {
            console.error(`[Chat] Failed to remove temporary upload ${file.path}`, err);
          }
        }),
      ),
    );
  }
}

// ---------------------------------------------------------
// Messages
// ---------------------------------------------------------

async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(
      conversationId
    ).populate("participants", "name");

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const isParticipant =
      conversation.participants.some(
        (participant) =>
          participant._id.toString() ===
          req.user.id.toString()
      );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (
      !(await isCurrentRideMember(
        conversation.rideId,
        req.user.id
      ))
    ) {
      return res.status(403).json({
        message:
          "You are no longer a member of this ride",
      });
    }

    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(req.query.limit, 10) || 50
      )
    );

    const [messages, total] = await Promise.all([
      Message.find({ conversationId })
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("sender", "name"),

      Message.countDocuments({ conversationId }),
    ]);

    messages.reverse();

    let groupDetails;

    if (conversation.type === "ride_group") {
      const ride = await Ride.findById(
        conversation.rideId
      )
        .select("createdBy bookingRequests")
        .populate("bookingRequests.user", "name");

      groupDetails = {
        ownerId: ride?.createdBy,

        eligibleParticipants: (
          ride?.bookingRequests || []
        )
          .filter(
            (request) =>
              request.status === "accepted"
          )
          .map((request) => request.user),
      };
    }

    return res.status(200).json({
      messages,

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },

      currentUser: req.user.id,

      conversation: {
        type: conversation.type,
        groupName: conversation.groupName,
        participants: conversation.participants,
        ...groupDetails,
      },
    });
  } catch (err) {
    console.error("[getMessages]", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
}

// ---------------------------------------------------------
// Get attachment from Cloudinary
// ---------------------------------------------------------

async function getAttachment(req, res) {
  try {
    const { filename } = req.params;

    if (!/^[\w.-]+$/.test(filename)) {
      return res.status(400).json({
        message: "Invalid attachment name",
      });
    }

    const attachmentUrl =
      `/api/chat/attachments/${filename}`;

    const message = await Message.findOne({
      "attachments.url": attachmentUrl,
    });

    if (!message) {
      return res.status(404).json({
        message: "Attachment not found",
      });
    }

    const conversation =
      await Conversation.findById(
        message.conversationId
      ).select("participants rideId");

    const isParticipant =
      conversation?.participants.some(
        (participant) =>
          participant.toString() ===
          req.user.id.toString()
      );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (
      !(await isCurrentRideMember(
        conversation.rideId,
        req.user.id
      ))
    ) {
      return res.status(403).json({
        message:
          "You are no longer a member of this ride",
      });
    }

    const attachment =
      message.attachments.find(
        (item) => item.url === attachmentUrl
      );

    if (!attachment) {
      return res.status(404).json({
        message: "Attachment not found",
      });
    }

    // The filename is our Cloudinary public_id.
    const publicId = filename;

    const isPdf =
      attachment.mimeType ===
      "application/pdf";

    const resourceType = isPdf
      ? "raw"
      : "image";

    // Fetch through the server so authenticated browser requests do not depend
    // on Cloudinary's cross-origin response headers.
    const signedUrl = cloudinary.url(publicId, {
      secure: true,
      sign_url: true,
      type: "authenticated",
      resource_type: resourceType,
    });

    const cloudinaryResponse = await fetch(signedUrl);
    if (!cloudinaryResponse.ok) {
      console.error(
        `[Cloudinary] Attachment fetch failed with status ${cloudinaryResponse.status}`
      );
      return res.status(502).json({ message: "Unable to load attachment" });
    }

    const fileName = attachment.fileName.replace(/["\\\r\n]/g, "_");
    const disposition = req.query.download === "1" ? "attachment" : "inline";
    res.set({
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `${disposition}; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    });

    if (!cloudinaryResponse.body) {
      return res.status(502).json({ message: "Unable to load attachment" });
    }

    res.status(200);
    await pipeline(Readable.fromWeb(cloudinaryResponse.body), res);
  } catch (err) {
    console.error("[getAttachment]", err);

    if (res.headersSent) {
      return res.destroy(err);
    }

    return res.status(500).json({
      message: "Unable to load attachment",
    });
  }
}

// ---------------------------------------------------------
// Edit message
// ---------------------------------------------------------

async function editMessage(req, res) {
  try {
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        message: "Invalid message id",
      });
    }

    const { text } = req.body;
    const cleanedText = text?.trim();

    if (!cleanedText) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    const message = await Message.findById(
      messageId
    );

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (
      message.sender.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        message:
          "Not authorized to edit this message",
      });
    }

    const conversation =
      await Conversation.findById(
        message.conversationId
      ).select("participants rideId");

    const isParticipant =
      conversation?.participants.some(
        (participant) =>
          participant.toString() ===
          req.user.id.toString()
      );

    if (
      !isParticipant ||
      !(await isCurrentRideMember(
        conversation.rideId,
        req.user.id
      ))
    ) {
      return res.status(403).json({
        message:
          "Not authorized to edit this message",
      });
    }

    message.text = cleanedText;
    message.edited = true;

    await message.save();

    const updatedMessage =
      await Message.findById(
        messageId
      ).populate("sender", "name _id");

    const io = getIo();

    if (conversation) {
      conversation.participants.forEach(
        (participant) => {
          io.to(participant.toString()).emit(
            "messageEdited",
            updatedMessage
          );
        }
      );
    }

    return res.status(200).json({
      message: updatedMessage,
    });
  } catch (err) {
    console.error("[editMessage]", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
}

// ---------------------------------------------------------
// Delete message + Cloudinary attachments
// ---------------------------------------------------------

async function deleteMessage(req, res) {
  try {
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        message: "Invalid message id",
      });
    }

    const message = await Message.findById(
      messageId
    );

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (
      message.sender.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        message:
          "Not authorized to delete this message",
      });
    }

    const conversation =
      await Conversation.findById(
        message.conversationId
      ).select("participants rideId");

    const isParticipant =
      conversation?.participants.some(
        (participant) =>
          participant.toString() ===
          req.user.id.toString()
      );

    if (
      !isParticipant ||
      !(await isCurrentRideMember(
        conversation.rideId,
        req.user.id
      ))
    ) {
      return res.status(403).json({
        message:
          "Not authorized to delete this message",
      });
    }

    // -----------------------------------------------
    // Delete attachments from Cloudinary
    // -----------------------------------------------

    for (const attachment of message.attachments || []) {
      try {
        const match =
          attachment.url?.match(
            /\/api\/chat\/attachments\/([^/]+)$/
          );

        if (!match) {
          continue;
        }

        const publicId =
          decodeURIComponent(match[1]);

        const resourceType =
          attachment.mimeType ===
          "application/pdf"
            ? "raw"
            : "image";

        await deleteCloudinaryFile(
          publicId,
          resourceType
        );
      } catch (error) {
        console.error(
          "[Cloudinary] Attachment delete failed:",
          error
        );
      }
    }

    const conversationId =
      message.conversationId;

    await Message.findByIdAndDelete(messageId);

    const io = getIo();

    if (conversation) {
      conversation.participants.forEach(
        (participant) => {
          io.to(participant.toString()).emit(
            "messageDeleted",
            {
              messageId,
              conversationId,
            }
          );
        }
      );
    }

    return res.status(200).json({
      message: "Message deleted",
    });
  } catch (err) {
    console.error("[deleteMessage]", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
}

// ---------------------------------------------------------
// Exports
// ---------------------------------------------------------

module.exports = {
  createConversation,
  createRideGroup,
  getRideGroup,
  updateRideGroup,
  sendMessage,
  getMessages,
  getAttachment,
  getRideChats,
  editMessage,
  deleteMessage,
};