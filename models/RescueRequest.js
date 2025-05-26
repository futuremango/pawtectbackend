const mongoose = require('mongoose');

const rescueRequestSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  location: String,
  animalType: String,
  description: String,
}, { collection: 'RescueRequests' });

module.exports = mongoose.model('RescueRequest', rescueRequestSchema);