const express = require('express');
const router = express.Router();
const rescueController = require('../controllers/rescueController');

router.post('/rescue', rescueController.submitRescue);

module.exports = router;