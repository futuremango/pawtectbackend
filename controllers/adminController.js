const AdoptionPet = require('../models/AdoptionPet');
const User = require('../models/User');

// Add Adoption Pet (with image and medicalHistory)
exports.addAdoptionPet = async (req, res) => {
  try {
    // Parse medicalHistory from JSON string
    const medicalHistory = JSON.parse(req.body.medicalHistory);

    const newPet = await AdoptionPet.create({
      ...req.body,
      medicalHistory, // Parsed object
      image: req.file.path, // Multer file path
      addedBy: req.admin._id,
      adoptionStatus: 'Available' // Match enum in schema
    });

    console.log(`New pet added by ${req.admin.email}: ${newPet.name}`);
    res.status(201).json(newPet);
  } catch (err) {
    console.error(`Pet addition error: ${err.message}`);
    res.status(400).json({ error: 'Pet creation failed. Check data format.' });
  }
};

// Manage Users (Admin-only)
exports.manageUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Remove extra quote
    console.log(`User list accessed by ${req.admin.email}`); // Fix template string
    res.json(users);
  } catch (err) {
    console.error(`User management error: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};