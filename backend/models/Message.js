const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  message: String,
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);