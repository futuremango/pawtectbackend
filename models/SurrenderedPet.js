const mongoose = require('mongoose');

const surrenderedPetSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  petName: String,
  petType: String,
  petAge: Number,
  reason: String,
}, { collection: 'SurrenderedPets' });

module.exports = mongoose.model('SurrenderedPet', surrenderedPetSchema);