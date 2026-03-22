const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a room name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  topic: {
    type: String,
    default: 'General Discussion',
    maxlength: [100, 'Topic cannot exceed 100 characters']
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number,
    default: 50
  },
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
