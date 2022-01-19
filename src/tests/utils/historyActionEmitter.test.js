const nock = require('nock');

const { mapUsersIntoHistoryAction } = require('../../utils/historyActionEmitter');
const internalService = require('../../services/internal');

const { DOCKER_AUTH_SERVICE_URL } = process.env;
const baseUrl = `http://${DOCKER_AUTH_SERVICE_URL}/internal`;

afterEach(() => {
  jest.clearAllMocks();
});

test('Should call getUsersAnsGuests with correct ids', async () => {
  nock(baseUrl)
    .post('/users')
    .reply(200, {
      success: true,
      data: [],
    });
  nock(baseUrl)
    .post('/guests')
    .reply(200, {
      success: true,
      data: [],
    });

  const userFromId = '1';
  const guestToId = '2';
  const token = 'token';
  const actionMock = {
    action_type: 'ADMIN_CREATE_GUEST_CLAIM',
    user_from_id: userFromId,
    guest_to_id: guestToId,
    claim_date: new Date(),
    claim_type: 'morning',
    toObject() {
      return this;
    },
  };

  const getUsersAndGuestsSpy = jest.spyOn(internalService, 'getUsersAndGuests');
  await mapUsersIntoHistoryAction(actionMock, token);

  expect(getUsersAndGuestsSpy).toHaveBeenCalledTimes(1);
  expect(getUsersAndGuestsSpy).toHaveBeenCalledWith(token, [userFromId], [guestToId]);
});

test('Should map users correctly', async () => {
  const userOne = { id: '1', name: 'One' };
  const userTwo = { id: '2', name: 'Two' };
  nock(baseUrl)
    .post('/users')
    .reply(200, {
      success: true,
      data: [userOne, userTwo],
    });

  const token = 'token';
  const actionMock = {
    action_type: 'EDIT_ROLE',
    user_from_id: userOne.id,
    user_to_id: userTwo.id,
    new_role: 'VOLUNTEER',
    toObject() {
      return this;
    },
  };

  const getUsersAndGuestsSpy = jest.spyOn(internalService, 'getUsersAndGuests');
  const action = await mapUsersIntoHistoryAction(actionMock, token);

  expect(getUsersAndGuestsSpy).toHaveBeenCalledTimes(1);
  expect(getUsersAndGuestsSpy).toHaveBeenCalledWith(token, [userOne.id, userTwo.id], []);

  expect(action.user_from).toEqual(userOne);
  expect(action.user_to).toEqual(userTwo);
});
