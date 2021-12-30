const HistoryAction = require('../models/historyAction');
const BaseRepository = require('./BaseRepository');

class HistoryActionRepository extends BaseRepository {
  async getPaginated({ skip, limit }) {
    return this.model.getPaginated({ skip, limit });
  }
}

module.exports = new HistoryActionRepository(HistoryAction);
