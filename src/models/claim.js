const mongoose = require('mongoose');

const { claimTypes } = require('../database/constants');

const claimSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  },
);

claimSchema.statics = {
  async getUsersRatingFromClaimsFromDateToToday({ fromDate }) {
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
          lastDate: 1,
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

  async getMonthlyUsersReport() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return this.aggregate([
      {
        $match: {
          date: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            user_id: '$user_id',
          },
        },
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month',
          },
          uniqueUsersCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          usersCount: '$uniqueUsersCount',
        },
      },
      {
        $sort: { year: 1, month: 1 },
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
