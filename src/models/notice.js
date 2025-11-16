const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  internalOnly: {
    type: Boolean,
    required: true,
    default: false,
  },
  animal_id: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notice', noticeSchema);
