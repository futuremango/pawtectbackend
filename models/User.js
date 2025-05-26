const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '/images/default-avatar.jpg' },
  bio: { type: String, default: '', trim: true },
  // Update phone validation
// In User.js, update the phone field validation:
phone: { 
  type: String,
  required: [true, 'Phone number is required'],
  validate: {
    validator: function(v) {
      const phoneStr = String(v); // Convert to string
      return /^\d{10,15}$/.test(phoneStr);
    },
    message: 'Invalid phone number format (10-15 digits required)'
  }
},
  location: { type: String, default: '', trim: true }
}, { collection: 'Users' });

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.phone) {
    this.phone = this.phone.trim();
  }
 
  next();
});

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);