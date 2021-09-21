const { validationResult } = require('express-validator');

const historyActionRepository = require('../repositories/HistoryActionRepository');

const createAction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const newHistoryAction = await historyActionRepository.create(req.body);

    const { io } = req.app;
    io.emit('newAction', newHistoryAction);

    res.json({ success: true, data: newHistoryAction });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getActions = async (req, res) => {
  try {
    const historyActions = await historyActionRepository.getAll();
    res.json({
      success: true,
      data: historyActions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  createAction,
  getActions,
};
