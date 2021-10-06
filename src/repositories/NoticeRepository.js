const Notice = require('../models/notice');
const BaseRepository = require('./BaseRepository');

class NoticeRepository extends BaseRepository {
  getNoticesIds(filter) {
    return this.model.find(filter).select('_id');
  }
}

module.exports = new NoticeRepository(Notice);
