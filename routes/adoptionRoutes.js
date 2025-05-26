const express = require('express');
const router = express.Router();
const { 
  createPet, 
  getPets,
  createAdoptionRequest,
  getAdoptionRequests,
  updateRequestStatus,
  cancelAdoptionRequest,
  notifyRequester,
  getUserAdoptionRequests // ✅ Imported
} = require('../controllers/adoptionController');

// Middleware imports
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuthMiddleware');
const upload = require('../config/multer').imageUpload;

// Route order matters!
router.get('/user/requests', authMiddleware, getUserAdoptionRequests); // ✅ Static first
router.delete('/requests/:id', authMiddleware, cancelAdoptionRequest);
router.post('/:petId/request', authMiddleware, createAdoptionRequest); // ✅ Dynamic after
// Other routes
router.get('/requests', authMiddleware, getAdoptionRequests);
router.post('/', upload.single('image'), createPet);
router.get('/', getPets);
router.patch('/requests/:id/status', adminAuth, updateRequestStatus);
router.post('/requests/:id/notify', adminAuth, notifyRequester);

module.exports = router;