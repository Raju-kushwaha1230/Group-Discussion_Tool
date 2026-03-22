const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room',
    required: true
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Please add text content']
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  reactions: [{
    emoji: String,
    users: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  }]
}, {
  timestamps: true
});

// Index to improve querying messages by room
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
