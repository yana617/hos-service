const { emitter } = require('../utils/historyActionEmitter');

const onClaimAction = ({
  token,
  actionType,
  guestId,
  userFromId,
  date,
  type,
}) => {
  const actionData = {
    action_type: actionType,
    user_from_id: userFromId,
    claim_type: type,
    claim_date: date,
    token,
  };
  if (actionType === 'ADMIN_CREATE_GUEST_CLAIM' || actionType === 'ADMIN_DELETE_GUEST_CLAIM') {
    actionData.guest_to_id = guestId;
  }

  emitter.emit('newHistoryAction', actionData);
};

module.exports = {
  onClaimAction,
};
