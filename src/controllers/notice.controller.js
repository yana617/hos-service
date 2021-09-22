const { ERRORS } = require('../translates');
const noticeRepository = require('../repositories/NoticeRepository');

const createNotice = async (req, res) => {
  const { title, description, authorized } = req.body;
  const newNotice = await noticeRepository.create({ title, description, authorized });
  res.json({ success: true, data: newNotice });
};

const getNotice = async (req, res) => {
  const { id } = req.params;
  const notice = await noticeRepository.getById(id);
  if (!notice) {
    return res.status(404).json({ success: false, error: ERRORS.NOTICE_NOT_FOUND });
  }
  res.json({ success: true, data: notice });
};

const getNoticesIds = async (req, res) => {
  const notices = await noticeRepository.getNoticesIds();
  res.json({ success: true, data: notices.map((notice) => notice._id) });
};

const updateNotice = async (req, res) => {
  const { id } = req.params;
  const { title, description, authorized } = req.body;
  const notice = await noticeRepository.update(id, { title, description, authorized });
  if (!notice) {
    return res.status(404).json({ success: false, error: ERRORS.NOTICE_NOT_FOUND });
  }
  res.json({ success: true, data: notice });
};

const deleteNotice = async (req, res) => {
  const { id } = req.params;
  const notice = await noticeRepository.deleteById(id);
  if (!notice) {
    return res.status(404).json({ success: false, error: ERRORS.NOTICE_NOT_FOUND });
  }
  res.status(204).send();
};

module.exports = {
  createNotice,
  getNotice,
  getNoticesIds,
  updateNotice,
  deleteNotice,
};
