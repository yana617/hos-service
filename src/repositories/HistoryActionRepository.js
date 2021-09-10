const HistoryAction = require('../models/historyAction');
const BaseRepository = require('./BaseRepository');

class HistoryActionRepository extends BaseRepository {
}

module.exports = new HistoryActionRepository(HistoryAction);
