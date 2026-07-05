const Notification = require("./notifications.model");
const { getIo } = require("../../socket");

async function sendNotification({ user, type, message, ride, conversation }) {
  const notification = await Notification.create({
    user,
    type,
    message,
    ride,
    conversation,
  });

  const io = getIo();

  io.to(user.toString()).emit("notification", notification.toObject());

  return notification;
}

module.exports = {
  sendNotification,
};
