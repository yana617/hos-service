const Claim = require('../models/claim');
const BaseRepository = require('./BaseRepository');

const SOME_OLD_DATE = new Date('2000-01');

const generateOptions = (from, to) => {
  const options = {};
  if (from) {
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0);
    options.date = {};
    options.date.$gte = fromDate;
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(24, 0, 0);
    if (!options.date) {
      options.date = {};
    }
    options.date.$lt = toDate;
  }
  return options;
};

class ClaimRepository extends BaseRepository {
  async getWithFilters({ from, to }) {
    const options = generateOptions(from, to);
    return this.model.find(options).lean();
  }

  async getClaimsByUserIdWithoutGuests(userId) {
    return this.model.find({
      user_id: userId,
      guest_id: null,
    });
  }

  async getUsersRatingFromClaimsFromDateToToday(fromDate = SOME_OLD_DATE) {
    return this.model.getUsersRatingFromClaimsFromDateToToday({
      fromDate,
    });
  }
}

module.exports = new ClaimRepository(Claim);
