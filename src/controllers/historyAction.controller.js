const { emitter } = require('../utils/historyActionEmitter');
const historyActionRepository = require('../repositories/HistoryActionRepository');
const internalService = require('../services/internal');
const { DEFAULT_LIMIT } = require('../database/constants');

const createAction = async (req, res) => {
  emitter.emit('newHistoryAction', { ...req.body, token: req.token });
  res.json({ success: true });
};

const getActions = async (req, res) => {
  const {
    limit = DEFAULT_LIMIT,
    skip = 0,
  } = req.query;

  const total = await historyActionRepository.count();
  let historyActions = await historyActionRepository.getAllFiltered({ limit, skip });

  const usersIds = new Set();
  const guestIds = new Set();
  historyActions.forEach((action) => {
    usersIds.add(action.user_from_id);
    if (action.user_to_id) {
      usersIds.add(action.user_to_id);
    }
    if (action.guest_to_id) {
      guestIds.add(action.guest_to_id);
    }
  });

  const { users, guests } = await internalService
    .getUsersAndGuests(req.token, Array.from(usersIds), Array.from(guestIds));

  historyActions = historyActions.map((action) => {
    let user_to = null;
    let guest_to = null;
    if (action.user_to_id) {
      user_to = users[action.user_to_id];
    }
    if (action.guest_to_id) {
      guest_to = guests[action.guest_to_id];
    }
    return {
      ...action,
      user_from: users[action.user_from_id],
      user_to,
      guest_to,
    };
  });

  res.json({
    success: true,
    data: { historyActions, total },
  });
};

module.exports = {
  createAction,
  getActions,
};
