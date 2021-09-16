const { validationResult } = require('express-validator');

const { ERRORS } = require('../translates');
const noticeRepository = require('../repositories/NoticeRepository');

const createNotice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { title, description, authorized } = req.body;
    const newNotice = await noticeRepository.create({ title, description, authorized });
    res.json({ success: true, data: newNotice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await noticeRepository.getById(id);
    if (!notice) {
      return res.status(400).json({ success: false, error: ERRORS.NOTICE_NOT_FOUND });
    }
    res.json({ success: true, data: notice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getNoticesIds = async (req, res) => {
  try {
    const notices = await noticeRepository.getNoticesIds();
    res.json({ success: true, data: notices.map((notice) => notice._id) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateNotice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { id } = req.params;
    const { title, description, authorized } = req.body;
    const notice = await noticeRepository.update(id, { title, description, authorized });
    if (!notice) {
      return res.status(404).json({ success: false, error: ERRORS.NOTICE_NOT_FOUND });
    }
    res.json({ success: true, data: notice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await noticeRepository.deleteById(id);
    if (!notice) {
      return res.status(404).json({ success: false, error: ERRORS.NOTICE_NOT_FOUND });
    }
    res.json({ success: true, data: notice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  createNotice,
  getNotice,
  getNoticesIds,
  updateNotice,
  deleteNotice,
};
