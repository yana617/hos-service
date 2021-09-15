const Claim = require('../models/claim');
const BaseRepository = require('./BaseRepository');

class ClaimRepository extends BaseRepository {
  async getWithFilters({ from = new Date('1980'), to = new Date('2100') }) {
    const fromDate = new Date(from);
    fromDate.setHours(0);
    const toDate = new Date(to);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate.setSeconds(59);
    return this.model.find({
      date: {
        $gte: fromDate,
        $lt: toDate,
      },
    }).lean();
  }
}

module.exports = new ClaimRepository(Claim);
