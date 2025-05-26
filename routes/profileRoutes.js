const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');
const { avatarUpload, handleMulterErrors } = require('../config/multer');

// Correct route path and middleware order
router.patch('/profile',
    authMiddleware,
    (req, res, next) => {
      console.log('[Profile Route] Starting profile update');
      next();
    },
    avatarUpload.single('avatar'),
    handleMulterErrors,
    profileController.updateProfile
  );
module.exports = router;