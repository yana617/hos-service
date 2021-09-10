const mongoose = require('mongoose');

const { historyActionTypes, claimTypes } = require('../database/constants');

const historyActionSchema = new mongoose.Schema({
  action_type: {
    type: String,
    enum: historyActionTypes,
    required: true,
  },
  user_from: {
    type: String,
  },
  user_to: {
    type: String,
  },
  new_role: {
    type: String,
  },
  claim_date: {
    type: Date,
  },
  claim_type: {
    type: String,
    enum: claimTypes,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('HistoryAction', historyActionSchema);
