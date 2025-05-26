const express = require('express');
const { getAppointments } = require('../controllers/vetAppointmentsController');
const router = express.Router();

router.get('/', getAppointments);

module.exports = router;
