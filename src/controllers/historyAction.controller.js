const { emitter } = require('../utils/historyActionEmitter');
const historyActionRepository = require('../repositories/HistoryActionRepository');

const createAction = async (req, res) => {
  try {
    emitter.emit('newHistoryAction', req.body);
    res.json({ success: true });
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
