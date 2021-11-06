const HistoryAction = require('../models/historyAction');
const BaseRepository = require('./BaseRepository');

class HistoryActionRepository extends BaseRepository {
  async getAllFiltered({ skip, limit }) {
    return this.model.getAllFiltered({ skip, limit });
  }
}

module.exports = new HistoryActionRepository(HistoryAction);
