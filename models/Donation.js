const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['money', 'item'], 
    required: true 
  },
  amount: {
    type: Number,
    min: 1,
    required: function() { return this.type === 'money'; }
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP'],
    default: 'USD'
  },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, min: 1, required: true },
    category: { 
      type: String,
      enum: ['food', 'medicine', 'toys', 'equipment', 'other'],
      required: true
    }
  }],
  paymentIntentId: String, // Add this field
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  message: String,
  pickupAddress: String,
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Donation', donationSchema);