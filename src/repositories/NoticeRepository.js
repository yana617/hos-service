const Notice = require('../models/notice');
const BaseRepository = require('./BaseRepository');

class NoticeRepository extends BaseRepository {
  getNoticesIds() {
    return this.model.find({}).select('_id');
  }
}

module.exports = new NoticeRepository(Notice);
