const mongoose = require('mongoose');

const volunteerCVSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  cvPath: String,
}, { collection: 'VolunteerCVs' });

module.exports = mongoose.model('VolunteerCV', volunteerCVSchema);