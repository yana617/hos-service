const mongoose = require('mongoose');

const { historyActionTypes, claimTypes } = require('../database/constants');

const historyActionSchema = new mongoose.Schema({
  action_type: {
    type: String,
    enum: historyActionTypes,
    required: true,
  },
  user_from_id: {
    type: String,
    required: true,
  },
  user_to_id: {
    type: String,
  },
  guest_to_id: {
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

historyActionSchema.statics = {
  async getPaginated({ skip, limit }) {
    return this.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      { $skip: parseInt(skip, 10) },
      { $limit: parseInt(limit, 10) },
    ]);
  },
};

historyActionSchema.methods = {
  toJSON() {
    const historyAction = this.toObject();
    return historyAction;
  },
};

module.exports = mongoose.model('HistoryAction', historyActionSchema);
