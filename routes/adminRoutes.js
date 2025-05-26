const express = require('express');
const router = express.Router();
const adminAuthMiddleware  = require('../middleware/adminAuthMiddleware');
const { imageUpload } = require('../config/multer'); // <-- यह सही पाथ है
const {
  getAdoptionRequests,
  updateRequestStatus
} = require('../controllers/adoptionController');
const { 
  addAdoptionPet, 
  manageUsers 
} = require('../controllers/adminController'); // Correct path
console.log('[DEBUG] manageUsers:', manageUsers); // Should log the function
// Import required models for stats
const User = require('../models/User');
const AdoptionPet = require('../models/AdoptionPet');
const Admin = require('../models/Admin')
const AdoptionRequest = require('../models/AdoptionRequest');
const Rescue = require('../models/RescueRequest');
const Volunteer = require('../models/VolunteerCV');
const Surrender = require('../models/SurrenderedPet');

// ✔️ Keep these routes ✔️
router.get('/me', adminAuthMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ==============================================
// Admin Verification Route (Essential for frontend session checks)
// ==============================================
router.get('/verify', adminAuthMiddleware, (req, res) => {
  console.log('[Admin Verify] Successful verification for:', req.admin.email);
  res.status(200).json({
    verified: true,
    status: 'active',
    admin: {
      _id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role
    }
  });
});
// Add this route to your adminRoutes.js
router.get('/stats', adminAuthMiddleware, async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      pets: await AdoptionPet.countDocuments({ adoptionStatus: 'Available' }),
      adoptions: await AdoptionRequest.countDocuments({ status: 'approved' }),
      rescues: await Rescue.countDocuments({ status: 'pending' }),
      volunteers: await Volunteer.countDocuments(),
      surrenders: await Surrender.countDocuments({ status: 'pending' })
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching stats' });
  }
});
// ==============================================
// Adoption Management Routes
// ==============================================
router.post('/adoption', 
  adminAuthMiddleware,        // Verify admin token
  imageUpload.single('image'), // Handle image upload
  addAdoptionPet              // Create new adoption pet
);

// ==============================================
// User Management Routes
// ==============================================
router.get('/users', 
  adminAuthMiddleware, // Middleware first
  manageUsers          // Controller second
);
// ==============================================
// Test Route (Optional)
// ==============================================
router.get('/test', adminAuthMiddleware, (req, res) => {
  res.json({ 
    status: 'Admin route working!',
    admin: req.admin.email
  });
});
// ================= Request Management =================
router.get('/requests', adminAuthMiddleware, getAdoptionRequests);
router.patch('/requests/:id', adminAuthMiddleware, updateRequestStatus);

module.exports = router;