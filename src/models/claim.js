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

claimSchema.statics = {
  async getClaimsFromDateToToday({ fromDate }) {
    return this.aggregate([
      {
        $match: {
          date: {
            $gte: fromDate,
          },
          guest_id: null,
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
      {
        $group: {
          _id: '$user_id',
          lastDate: { $first: '$date' },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          claimsCount: '$count',
          lastDate: '$lastDate',
        },
      },
      {
        $sort: {
          claimsCount: -1,
          lastDate: -1,
        },
      },
    ]);
  },
};

claimSchema.methods = {
  toJSON() {
    const claim = this.toObject();
    return claim;
  },
};

module.exports = mongoose.model('Claim', claimSchema);
