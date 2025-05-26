const mongoose = require('mongoose');

const adoptionPetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  species: { type: String, required: true, enum: ['Dog', 'Cat', 'Bird', 'Other'] },
  breed: { type: String, required: true },
  age: { type: Number, required: true, min: 0 },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Unknown'] },
  medicalHistory: {
    vaccinated: Boolean,
    neutered: Boolean,
    specialNeeds: String
  },
  description: { type: String, required: true },
  image: { type: String, required: true },
  adoptionStatus: { 
    type: String, 
    required: true,
    enum: ['Available', 'Pending', 'Adopted'],
    default: 'Available'
  },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdoptionPet', adoptionPetSchema);