const EventEmitter = require('events');

const historyActionRepository = require('../repositories/HistoryActionRepository');
const internalService = require('../services/internal');

const myEmitter = new EventEmitter();

exports.emitter = myEmitter;

const mapUsersIntoHistoryAction = async (newHistoryAction, token) => {
  const action = newHistoryAction.toObject();
  const { users, guests } = await internalService.getUsersAndGuests(
    token,
    [newHistoryAction.user_from_id, newHistoryAction.user_to_id].filter((id) => !!id),
    newHistoryAction.guest_to_id ? [newHistoryAction.guest_to_id] : [],
  );
  action.user_from = users[newHistoryAction.user_from_id];
  if (['ADMIN_CREATE_GUEST_CLAIM', 'ADMIN_DELETE_GUEST_CLAIM'].includes(newHistoryAction.action_type)) {
    action.guest_to = guests[newHistoryAction.guest_to_id];
  }
  if (newHistoryAction.action_type === 'EDIT_ROLE') {
    action.user_to = users[newHistoryAction.user_to_id];
  }
  return action;
};

exports.startEmitter = (io) => {
  myEmitter.on('newHistoryAction', async (actionData) => {
    const action = await historyActionRepository.create(actionData);
    const mappedAction = await mapUsersIntoHistoryAction(action, actionData.token);

    io.emit('newAction', mappedAction);
  });
};

exports.mapUsersIntoHistoryAction = mapUsersIntoHistoryAction;
