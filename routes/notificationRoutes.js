const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/notifications', authMiddleware, notificationController.getNotifications);
router.patch('/notifications/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router;