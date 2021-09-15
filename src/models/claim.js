const mongoose = require('mongoose');

const { claimTypes } = require('../database/constants');

const claimSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: claimTypes,
  },
  arrival_time: {
    type: String,
  },
  additional_people: {
    type: Number,
  },
  comment: {
    type: String,
  },
  questionable: {
    type: Boolean,
    default: false,
  },
  user_id: {
    type: String,
    required: true,
  },
  guest_id: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Claim', claimSchema);
