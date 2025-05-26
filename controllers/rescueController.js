const RescueRequest = require('../models/RescueRequest');

exports.submitRescue = async (req, res) => {
  try {
    const { name, email, phone, location, animalType, description } = req.body;
    
    const rescueRequest = new RescueRequest({
      name,
      email,
      phone,
      location,
      animalType,
      description
    });

    await rescueRequest.save();
    
    res.json({ 
      message: 'Rescue request received! Our team will reach out in 10 minutes.',
      rescueRequest 
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'An error occurred while processing your request.' 
    });
  }
};