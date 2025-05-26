const express = require('express');
const router = express.Router();
const SurrenderedPet = require('../models/SurrenderedPet');
const VolunteerCV = require('../models/VolunteerCV');
const RescueRequest = require('../models/RescueRequest');
const VetAppointment = require('../models/vetModel');


// Get all surrendered pets
router.get('/surrenders', async (req, res) => {
  try {
    const surrenders = await SurrenderedPet.find();
    res.json(surrenders);
  } catch (err) {
    console.error('Error fetching surrenders:', err);
    res.status(500).json({ error: 'Failed to fetch surrendered pets' });
  }
});

// Get all volunteer CVs
router.get('/volunteers', async (req, res) => {
  try {
    const volunteers = await VolunteerCV.find();
    res.json(volunteers);
  } catch (err) {
    console.error('Error fetching volunteers:', err);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

// Get all rescue requests
router.get('/rescues', async (req, res) => {
  try {
    const rescues = await RescueRequest.find();
    res.json(rescues);
  } catch (err) {
    console.error('Error fetching rescues:', err);
    res.status(500).json({ error: 'Failed to fetch rescue requests' });
  }
});

router.get('/vetappointments', async (req, res) => {
  try {
    const appointments = await VetAppointment.find();
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching vet appointments:', err);
    res.status(500).json({ error: 'Failed to fetch vet appointments' });
  }
});





//=================================DELETE BUTTONS
// DELETE a surrendered pet by ID
router.delete('/surrenders/:id', async (req, res) => {
  try {
    await SurrenderedPet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Surrendered pet deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete surrendered pet' });
  }
});

// DELETE a volunteer CV by ID
router.delete('/volunteers/:id', async (req, res) => {
  try {
    await VolunteerCV.findByIdAndDelete(req.params.id);
    res.json({ message: 'Volunteer deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete volunteer' });
  }
});

// DELETE a rescue request by ID
router.delete('/rescues/:id', async (req, res) => {
  try {
    await RescueRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rescue request deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete rescue request' });
  }
});

// DELETE a vet appointment by ID
router.delete('/vetappointments/:id', async (req, res) => {
  try {
    await VetAppointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vet appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vet appointment' });
  }
});


module.exports = router;
