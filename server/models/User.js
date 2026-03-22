const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    maxlength: [30, 'Username cannot be more than 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super-admin'],
    default: 'user'
  },
  workspaces: [{
    workspace: {
      type: mongoose.Schema.ObjectId,
      ref: 'Workspace'
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  displayName: {
    type: String,
    maxlength: [50, 'Display name cannot be more than 50 characters'],
    default: function() { return this.username; }
  },
  workspaceName: {
    type: String,
    maxlength: [100, 'Workspace name cannot exceed 100 characters'],
    default: ''
  },
  workspaceHandle: {
    type: String,
    maxlength: [50, 'Workspace handle cannot exceed 50 characters'],
    default: ''
  },
  onboarded: {
    type: Boolean,
    default: false
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot exceed 200 characters'],
    default: ''
  },
  skills: {
    type: [String],
    default: []
  },
  score: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: ''
  },
  adminRequestStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  adminRequestDetails: {
    type: String,
    maxlength: [500, 'Details cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
