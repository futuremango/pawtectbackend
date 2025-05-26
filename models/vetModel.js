const mongoose = require('mongoose');  // <-- Import mongoose here

const vetAppointmentSchema = new mongoose.Schema({
  user: { // Add user reference
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  reason: { type: String, required: true }
}, { collection: 'vetappointments', timestamps: true });  // Ensure the collection name is in lowercase

const VetAppointment = mongoose.model('VetAppointment', vetAppointmentSchema);
module.exports = VetAppointment;
