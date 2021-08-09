const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  authorized: {
    type: Boolean,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notice', noticeSchema);
