const VolunteerCV = require('../models/VolunteerCV');

exports.submitVolunteer = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const cvPath = req.file.path;

    const volunteerCV = new VolunteerCV({ name, email, phone, cvPath });
    const savedCV = await volunteerCV.save();
    
    res.json({ 
      message: 'Volunteer application received!',
      volunteerCV: savedCV
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'An error occurred while processing your application.' 
    });
  }
};