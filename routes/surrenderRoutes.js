const express = require('express');
const router = express.Router();
const surrenderController = require('../controllers/surrenderController');

router.post('/surrender', surrenderController.submitSurrender);

module.exports = router;