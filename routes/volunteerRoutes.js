const express = require('express');
const router = express.Router();
const { cvUpload, handleMulterErrors } = require('../config/multer');
const volunteerController = require('../controllers/volunteerController');

router.post('/volunteer',
  cvUpload.single('cv'), // Use CV-specific config
  handleMulterErrors,    // Add error handler
  volunteerController.submitVolunteer
);

module.exports = router;