const mongoose = require('mongoose');

// This defines what a "User" looks like in our database
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,   // name is compulsory
    trim: true        // removes extra spaces
  },
  email: {
    type: String,
    required: true,
    unique: true,     // no two users can have same email
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true    // auto adds createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);