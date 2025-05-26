const express = require('express');
const router = express.Router();
// Update the import at the top
const {
  createPaymentIntent,// Add this
  createDonation,
  getUserDonations,
  getAllDonations,
  updateDonationStatus,
  deleteDonation,
  sendDonationEmail
} = require('../controllers/donationController');
const adminAuth = require('../middleware/adminAuthMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// Add this route before other routes
router.route('/create-payment-intent')
  .post(authMiddleware, createPaymentIntent);
  
// Regular user routes
router.route('/')
  .post(authMiddleware, createDonation);

router.route('/my-donations')
  .get(authMiddleware, getUserDonations);

// Admin-only routes
router.route('/all')
  .get(adminAuth, getAllDonations);

router.route('/:id/status')
  .put(adminAuth, updateDonationStatus);

// Add this new route for notifications
router.route('/:id/notify')
  .post(adminAuth, sendDonationEmail);

router.route('/:id')
  .delete(authMiddleware, deleteDonation);

module.exports = router;