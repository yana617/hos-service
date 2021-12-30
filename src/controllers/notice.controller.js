const { ERRORS } = require('../translates');
const noticeRepository = require('../repositories/NoticeRepository');
const { getPermissions } = require('../api/authService');

const createNotice = async (req, res) => {
  const { title, description, internalOnly } = req.body;
  const newNotice = await noticeRepository.create({ title, description, internalOnly });
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
  const filter = {};
  const userPermissions = await getPermissions(req.token);
  if (!userPermissions.includes('CREATE_CLAIM')) {
    filter.internalOnly = false;
  }

  const notices = await noticeRepository.getNoticesIds(filter);
  res.json({ success: true, data: notices.map((notice) => notice._id) });
};

const updateNotice = async (req, res) => {
  const { id } = req.params;
  const { title, description, internalOnly } = req.body;
  const notice = await noticeRepository.update(id, { title, description, internalOnly });
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
