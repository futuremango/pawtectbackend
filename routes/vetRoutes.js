const express = require('express');
const router = express.Router();
const vetController = require('../controllers/vetController');
const authMiddleware = require('../middleware/authMiddleware');

// Single endpoint with query params
router.get('/appointments', authMiddleware, vetController.getAppointments);

// Keep appointment booking as-is
router.post('/appointments',authMiddleware, vetController.bookAppointment);
router.delete('/appointments/:id', authMiddleware, vetController.cancelAppointment);
console.log("vetController.bookAppointment:", vetController.bookAppointment); //testing

// In vetRoutes.js
router.get('/test-email', async (req, res) => {
    try {
      await transporter.sendMail({
        to: 'romysasidd21@gmail.com',
        subject: 'TEST Email from Pawtect',
        text: 'This is a direct email test'
      });
      res.send('Test email sent! Check your inbox.');
    } catch (error) {
      console.error('TEST EMAIL FAILED:', error);
      res.status(500).send('Failed to send test email');
    }
  });
  
module.exports = router;
