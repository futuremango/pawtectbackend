const mongoose = require('mongoose');

// Define the schema
const VetAppointmentSchema = new mongoose.Schema({
  petName: String,
  ownerName: String,
  email: String,
  date: String,
  time: String,
  reason: String,
}, { timestamps: true });

// Check if the model already exists to prevent overwriting
const VetAppointment = mongoose.models.VetAppointment || mongoose.model('VetAppointment', VetAppointmentSchema);

module.exports = VetAppointment;
