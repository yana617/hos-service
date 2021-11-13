const { emitter } = require('../../utils/historyActionEmitter');
const historyActionService = require('../../services/historyAction');

afterEach(() => {
  jest.clearAllMocks();
});

test('Should call emitter with correct info', async () => {
  const claimDate = new Date();
  const actionMock = {
    actionType: 'ADMIN_CREATE_GUEST_CLAIM',
    userFromId: '1',
    guestId: '1',
    date: claimDate,
    type: 'morning',
    token: 'correct',
  };

  const emitterSpy = jest.spyOn(emitter, 'emit');
  historyActionService.onClaimAction(actionMock);

  expect(emitterSpy).toHaveBeenCalledTimes(1);
  expect(emitterSpy).toHaveBeenCalledWith('newHistoryAction', {
    action_type: actionMock.actionType,
    user_from_id: actionMock.userFromId,
    guest_to_id: actionMock.guestId,
    claim_date: claimDate,
    claim_type: actionMock.type,
    token: actionMock.token,
  });
});

test('Should call emitter with correct info (without guest id)', async () => {
  const claimDate = new Date();
  const actionMock = {
    actionType: 'CREATE_CLAIM',
    userFromId: '1',
    date: claimDate,
    type: 'morning',
    token: 'correct',
  };

  const emitterSpy = jest.spyOn(emitter, 'emit');
  historyActionService.onClaimAction(actionMock);

  expect(emitterSpy).toHaveBeenCalledTimes(1);
  expect(emitterSpy).toHaveBeenCalledWith('newHistoryAction', {
    action_type: actionMock.actionType,
    user_from_id: actionMock.userFromId,
    claim_date: claimDate,
    claim_type: actionMock.type,
    token: actionMock.token,
  });
});
