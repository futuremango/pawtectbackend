const SurrenderedPet = require('../models/SurrenderedPet');

exports.submitSurrender = async (req, res) => {
  try {
    const { name, email, phone, petName, petType, petAge, reason } = req.body;
    
    const surrenderedPet = new SurrenderedPet({
      name,
      email,
      phone,
      petName,
      petType,
      petAge,
      reason
    });

    await surrenderedPet.save();
    
    res.json({ 
      message: 'Surrender request received! Our team will reach out in 10 minutes.',
      surrenderedPet 
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'An error occurred while processing your request.' 
    });
  }
};