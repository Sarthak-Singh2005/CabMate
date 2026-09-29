const Notification = require("./notifications.model");

async function getNotifications(req, res) {
  try {
    const query = { user: req.user.id };
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ ...query, isRead: false }),
    ]);
    return res.status(200).json({
      notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to load notifications" });
  }
}

async function markAllRead(req, res) {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } },
    );
    return res.status(200).json({ message: "Notifications marked as read" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update notifications" });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { $set: { isRead: true } },
      { new: true },
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.status(200).json({ notification });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update notification" });
  }
}

module.exports = { getNotifications, markAllRead, markAsRead };
