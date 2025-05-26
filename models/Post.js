const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
}, { _id: true }); // Make sure _id is enabled for comments

const postSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet_name: { type: String, required: true },
  description: { type: String, required: true },
  last_seen_location: { type: String, required: true },
  contact_info: { type: String, required: true },
  pet_image: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shares: { type: Number, default: 0 },
  comments: [commentSchema],
  status: { type: String, enum: ['lost', 'found'], default: 'lost' },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'Posts' });

module.exports = mongoose.model('Post', postSchema);