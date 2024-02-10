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

describe('POST /claims/ request', () => {
  test('Should create claim successfully', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: userId } });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['CREATE_CLAIM'] });
    const claimOne = { ...generateClaim(), user_id: userId };

    const onClaimActionSpy = jest.spyOn(historyActionService, 'onClaimAction');

    const response = await request(app)
      .post('/claims')
      .set('x-access-token', 'valid token')
      .send(claimOne)
      .expect(200);

    expect(onClaimActionSpy).toHaveBeenCalledTimes(1);

    const { data: claim } = response.body;
    expect(claim).toHaveProperty('type', claimOne.type);
    const claimInDB = await Claim.findById(claim._id);
    expect(claimInDB).not.toBeNull();
    expect(claimInDB).toHaveProperty('type', claimOne.type);
  });

  test('Should create guest claim successfully', async () => {
    const guestId = new mongoose.Types.ObjectId();
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: userId } });
    nock(baseUrl).post('/guest').reply(200, { success: true, data: { id: guestId } });
    nock(baseUrl).get('/permissions/me').reply(200, {
      success: true,
      data: ['CREATE_CLAIM', 'CREATE_CLAIM_FOR_UNREGISTERED_USERS'],
    });
    const claimOne = {
      ...generateClaim(),
      user_id: userId,
      guest: {
        phone: '375291111111',
        name: 'test',
        surname: 'test',
      },
    };

    const onClaimActionSpy = jest.spyOn(historyActionService, 'onClaimAction');

    const response = await request(app)
      .post('/claims')
      .set('x-access-token', 'valid token')
      .send(claimOne)
      .expect(200);

    expect(onClaimActionSpy).toHaveBeenCalledTimes(1);

    const { data: claim } = response.body;
    expect(claim).toHaveProperty('type', claimOne.type);
    const claimInDB = await Claim.findById(claim._id);
    expect(claimInDB).not.toBeNull();
    expect(claimInDB).toHaveProperty('type', claimOne.type);
    expect(claimInDB).toHaveProperty('guest_id', guestId.toString());
  });

  test('Should fail without auth', async () => {
    nock(baseUrl).get('/auth').reply(401, { success: false });
    const claimOne = { ...generateClaim(), user_id: userId };

    const response = await request(app)
      .post('/claims')
      .set('x-access-token', 'invalid token')
      .send(claimOne)
      .expect(401);

    const { error } = response.body;
    expect(error).toBe(ERRORS.AUTH_REQUIRED);
  });

  test('Should fail with validation errors', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    const claimOne = { ...generateClaim(), user_id: userId };

    const response = await request(app)
      .post('/claims')
      .set('x-access-token', 'invalid token')
      .send({ ...claimOne, type: 'invalid' })
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail with validation errors', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    const claimOne = { ...generateClaim(), user_id: userId };

    const response = await request(app)
      .post('/claims')
      .set('x-access-token', 'invalid token')
      .send({ ...claimOne, date: null })
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail with guest validation errors', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: userId } });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['CREATE_CLAIM'] });
    const claimOne = { ...generateClaim(), user_id: userId };

    const response = await request(app)
      .post('/claims')
      .set('x-access-token', 'invalid token')
      .send({ ...claimOne, guest: { name: 'guest' } })
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail with guest validation errors (phone)', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: userId } });
    nock(baseUrl).get('/permissions/me').reply(200, {
      success: true,
      data: ['CREATE_CLAIM', 'CREATE_CLAIM_FOR_UNREGISTERED_USERS'],
    });

    const claimOne = {
      ...generateClaim(),
      user_id: userId,
      guest: {
        phone: 'aaabbbcccddd',
        name: 'test',
        surname: 'test',
      },
    };

    const response = await request(app)
      .post('/claims')
      .set('x-access-token', 'invalid token')
      .send(claimOne)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail with not yours error', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: 'not yours' } });
    const claimOne = { ...generateClaim(), user_id: userId };

    const response = await request(app)
      .post('/claims')
      .set('x-access-token', 'invalid token')
      .send(claimOne)
      .expect(403);

    const { error } = response.body;
    expect(error).toBe(ERRORS.CREATE_NOT_YOURS_CLAIM_ERROR);
  });

  test('Should fail with not enough permissions for guest creation', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: userId } });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['CREATE_CLAIM'] });
    const claimOne = { ...generateClaim(), user_id: userId };

    const response = await request(app)
      .post('/claims')
      .set('x-access-token', 'invalid token')
      .send({ ...claimOne, guest: { name: 'Name', surname: 'Surname', phone: '375291111111' } })
      .expect(403);

    const { error } = response.body;
    expect(error).toBe(ERRORS.FORBIDDEN);
  });
});
