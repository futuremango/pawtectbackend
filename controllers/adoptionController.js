const User = require('../models/User');
const AdoptionRequest = require('../models/AdoptionRequest');
const AdoptionPet = require('../models/AdoptionPet');
const transporter = require('../config/emailConfig');
const mongoose = require('mongoose');

// Helper function for admin notifications
const sendAdminNotification = (user, request) => {
  console.log(`New adoption request from ${user.name} for pet ${request.pet}`);
  // Add email/notification logic here if needed
};

// Create new adoptable pet (Admin only)
exports.createPet = async (req, res) => {
  try {
    const imagePath = '/' + req.file.path
      .replace(/\\/g, '/')
      .replace(/.*?uploads\/images\//, 'uploads/images/');

    const newPet = new AdoptionPet({
      ...req.body,
      image: imagePath,
      addedBy: req.admin._id
    });

    await newPet.save();
    res.status(201).json(newPet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all adoptable pets
exports.getPets = async (req, res) => {
  try {
    const pets = await AdoptionPet.find().populate('addedBy', 'name');
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create adoption request
exports.createAdoptionRequest = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ error: 'Invalid pet ID' });
    }

    const pet = await AdoptionPet.findById(petId);
    const user = await User.findById(userId);

    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (pet.adoptionStatus !== 'Available') {
      return res.status(400).json({ error: 'Pet not available' });
    }

    const request = new AdoptionRequest({
      pet: petId,
      user: userId,
      status: 'pending'
    });

    await request.save();
    pet.adoptionStatus = 'Pending';
    await pet.save();

    sendAdminNotification(user, request);
    res.status(201).json(request);

  } catch (err) {
    console.error('Adoption Error:', err);
    res.status(400).json({ 
      error: err.message.includes('duplicate') 
        ? 'Duplicate request' 
        : 'Request failed'
    });
  }
};

// Get all adoption requests (Admin)
exports.getAdoptionRequests = async (req, res) => {
  try {
    const requests = await AdoptionRequest.find()
      .populate('pet', 'name image adoptionStatus')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// In adoptionController.js
exports.getUserAdoptionRequests = async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ user: req.user._id })
      .populate({
        path: 'pet',
        select: 'name image breed adoptionStatus',
        model: 'AdoptionPet'
      })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch requests',
      details: error.message 
    });
  }
};

// Update request status (Admin)
exports.updateRequestStatus = async (req, res) => {
  try {
    const request = await AdoptionRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    )
      .populate('pet')
      .populate('user');

    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.pet.adoptionStatus = req.body.status === 'approved' 
      ? 'Adopted' 
      : 'Available';
      
    await request.pet.save();
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Send status notification to user
exports.notifyRequester = async (req, res) => {
  try {
    const { subject, message, status } = req.body;
    const request = await AdoptionRequest.findById(req.params.id)
      .populate('user')
      .populate('pet');

    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (!request.user?.email) {
      return res.status(400).json({ error: 'User email not found' });
    }

    await AdoptionRequest.findByIdAndUpdate(request._id, {
      adminMessage: message,
      updatedAt: Date.now()
    });

    const mailOptions = {
      from: `"Pet Adoption" <${process.env.EMAIL_USER}>`,
      to: request.user.email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Adoption Update: ${request.pet.name}</h2>
          <p>Status: <strong>${status.toUpperCase()}</strong></p>
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Notification sent successfully' });

  } catch (err) {
    console.error('Notification Error:', err);
    res.status(500).json({ 
      error: 'Failed to send notification',
      details: err.message 
    });
  }
};

exports.cancelAdoptionRequest = async (req, res) => {
  try {
        // Add validation
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(400).json({ error: 'Invalid request ID' });
        }    
    
    const request = await AdoptionRequest.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
      status: 'pending'
    }).populate('pet');

    if (!request) {
      return res.status(404).json({ error: 'Request not found or cannot be canceled' });
    }

    // Reset pet status if request was pending
    if (request.pet.adoptionStatus === 'Pending') {
      request.pet.adoptionStatus = 'Available';
      await request.pet.save();
    }

    res.json({ 
      message: 'Request canceled successfully',
      canceledRequest: request 
    });

  } catch (error) {
    console.error('Cancel Error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel request',
      details: error.message 
    });
  }
};