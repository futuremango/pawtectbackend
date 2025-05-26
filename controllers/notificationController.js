const Notification = require('../models/Notification');
const transporter = require('../config/emailConfig'); // Add this line

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name')
      .populate('post')
      .populate('comment')
      .sort('-createdAt');

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.status(200).json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

