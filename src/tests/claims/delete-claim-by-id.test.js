const request = require('supertest');
const nock = require('nock');
const mongoose = require('mongoose');
const { v4 } = require('uuid');

const Claim = require('../../models/claim');
const { generateClaim, setupDatabase } = require('../fixtures/db');
const app = require('../../../app');
const { ERRORS } = require('../../translates');

jest.mock('../../services/historyAction');
const historyActionService = require('../../services/historyAction');

const { DOCKER_AUTH_SERVICE_URL } = process.env;
const baseUrl = `http://${DOCKER_AUTH_SERVICE_URL}/internal`;
const userId = v4();

beforeEach(async () => {
  await setupDatabase();
  nock.cleanAll();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('DELETE /claims/:claimId request', () => {
  beforeEach(() => {
    nock(baseUrl)
      .get('/auth')
      .reply(200, {
        success: true,
        data: {
          id: userId,
        },
      });
  });

  test('Should delete claim correctly', async () => {
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: userId } });
    const claimOne = generateClaim();
    await new Claim({ ...claimOne, user_id: userId }).save();

    const onClaimActionSpy = jest.spyOn(historyActionService, 'onClaimAction');

    await request(app)
      .delete(`/claims/${claimOne._id}`)
      .set('x-access-token', 'valid token')
      .expect(204);

    expect(onClaimActionSpy).toHaveBeenCalledTimes(1);

    const claimInDB = await Claim.findById(claimOne._id);
    expect(claimInDB).toBeNull();
  });

  test('Should fail because claim not found', async () => {
    const claimOne = generateClaim();
    await new Claim({ ...claimOne, user_id: userId }).save();

    const unExistedId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .delete(`/claims/${unExistedId}`)
      .set('x-access-token', 'valid token')
      .expect(404);

    const { error } = response.body;
    expect(error).toBe(ERRORS.CLAIM_NOT_FOUND);
  });

  test('Should fail because you try to delete not yours claim', async () => {
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: 'notUserFromClaim', role: 'USER' } });
    const claimOne = generateClaim();
    await new Claim({ ...claimOne, user_id: userId }).save();

    const response = await request(app)
      .delete(`/claims/${claimOne._id}`)
      .set('x-access-token', 'valid token')
      .expect(403);

    const { error } = response.body;
    expect(error).toBe(ERRORS.DELETE_NOT_YOURS_CLAIM_ERROR);
  });

  test('Should successfully delete not yours claim when you are an admin', async () => {
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: 'notUserFromClaim', role: 'ADMIN' } });
    const claimOne = generateClaim();
    await new Claim({ ...claimOne, user_id: userId }).save();

    await request(app)
      .delete(`/claims/${claimOne._id}`)
      .set('x-access-token', 'valid token')
      .expect(204);

    const claimInDB = await Claim.findById(claimOne._id);
    expect(claimInDB).toBeNull();
  });

  test('History actions: Should raise DELETE_CLAIM action type on delete own claim', async () => {
    const expectedHistoryActionType = 'DELETE_CLAIM';
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: userId } });
    const claimOne = generateClaim();
    await new Claim({ ...claimOne, user_id: userId }).save();

    const onClaimActionSpy = jest.spyOn(historyActionService, 'onClaimAction');

    await request(app)
      .delete(`/claims/${claimOne._id}`)
      .set('x-access-token', 'valid token')
      .expect(204);

    expect(onClaimActionSpy).toHaveBeenCalledTimes(1);
    expect(onClaimActionSpy).toHaveBeenCalledWith({
      actionType: expectedHistoryActionType,
      date: claimOne.date,
      token: 'valid token',
      type: claimOne.type,
      userFromId: userId,
    });
  });

  test('History actions: Should raise ADMIN_DELETE_GUEST_CLAIM action type on delete guest claim', async () => {
    const expectedHistoryActionType = 'ADMIN_DELETE_GUEST_CLAIM';
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: userId, role: 'ADMIN' } });
    const claimOne = generateClaim();
    const guestId = v4();
    await new Claim({ ...claimOne, user_id: userId, guest_id: guestId }).save();

    const onClaimActionSpy = jest.spyOn(historyActionService, 'onClaimAction');

    await request(app)
      .delete(`/claims/${claimOne._id}`)
      .set('x-access-token', 'valid token')
      .expect(204);

    expect(onClaimActionSpy).toHaveBeenCalledTimes(1);
    expect(onClaimActionSpy).toHaveBeenCalledWith({
      actionType: expectedHistoryActionType,
      date: claimOne.date,
      token: 'valid token',
      type: claimOne.type,
      guestId,
      userFromId: userId,
    });
  });

  test('History actions: Should raise ADMIN_DELETE_VOLUNTEER_CLAIM action type on delete other users claim', async () => {
    const expectedHistoryActionType = 'ADMIN_DELETE_VOLUNTEER_CLAIM';
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: userId, role: 'ADMIN' } });
    const claimOne = generateClaim();
    const volunteerId = v4();
    await new Claim({ ...claimOne, user_id: volunteerId }).save();

    const onClaimActionSpy = jest.spyOn(historyActionService, 'onClaimAction');

    await request(app)
      .delete(`/claims/${claimOne._id}`)
      .set('x-access-token', 'valid token')
      .expect(204);

    expect(onClaimActionSpy).toHaveBeenCalledTimes(1);
    expect(onClaimActionSpy).toHaveBeenCalledWith({
      actionType: expectedHistoryActionType,
      date: claimOne.date,
      token: 'valid token',
      type: claimOne.type,
      userFromId: userId,
      userToId: volunteerId,
    });
  });
});
