const request = require('supertest');
const nock = require('nock');
const mongoose = require('mongoose');

const Claim = require('../models/claim');
const {
  generateClaim,
  generateUser,
  setupDatabase,
  generateGuest,
} = require('./fixtures/db');
const app = require('../../app');
const { ERRORS } = require('../translates');

jest.mock('../services/historyAction');
const historyActionService = require('../services/historyAction');

const { DOCKER_AUTH_SERVICE_URL } = process.env;
const baseUrl = `http://${DOCKER_AUTH_SERVICE_URL}/internal`;
const userId = '9d2d4fde-d439-4b92-9b41-208f2327200b';

beforeEach(async () => {
  await setupDatabase();
  nock.cleanAll();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /claims request', () => {
  beforeEach(() => {
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
  });

  test('Should return claims correct', async () => {
    await new Claim(generateClaim()).save();
    await new Claim(generateClaim()).save();

    const onClaimActionSpy = jest.spyOn(historyActionService, 'onClaimAction');

    const response = await request(app)
      .get('/claims')
      .expect(200);

    expect(onClaimActionSpy).toHaveBeenCalledTimes(0);

    const { data: claims } = response.body;
    expect(claims.length).toBe(2);
  });

  test('Should return claims with from query only', async () => {
    await new Claim(generateClaim('2021-09-10')).save();
    await new Claim(generateClaim('2021-09-15')).save();

    const from = '2021-09-12';
    const response = await request(app)
      .get(`/claims?from=${from}`)
      .expect(200);

    const { data: claims } = response.body;
    expect(claims.length).toBe(1);
  });

  test('Should return claims with to query only', async () => {
    await new Claim(generateClaim('2021-09-10')).save();
    await new Claim(generateClaim('2021-09-11')).save();
    await new Claim(generateClaim('2021-09-15')).save();

    const to = '2021-09-12';
    const response = await request(app)
      .get(`/claims?to=${to}`)
      .expect(200);

    const { data: claims } = response.body;
    expect(claims.length).toBe(2);
  });

  test('Should return claims with from & to queries correctly', async () => {
    await new Claim(generateClaim('2021-09-10')).save();
    await new Claim(generateClaim('2021-09-12')).save();
    await new Claim(generateClaim('2021-09-15')).save();

    const from = '2021-09-11';
    const to = '2021-09-13';
    const response = await request(app)
      .get(`/claims?from=${from}&to=${to}`)
      .expect(200);

    const { data: claims } = response.body;
    expect(claims.length).toBe(1);
  });

  test('Should fail with invalid date', async () => {
    await new Claim(generateClaim('2021-09-10')).save();

    const from = 'invalid';
    const response = await request(app)
      .get(`/claims?from=${from}`)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should successfully set users', async () => {
    const userOne = generateUser();
    const guestOne = generateGuest();
    nock.cleanAll();
    nock(baseUrl).post('/users').reply(200, { success: true, data: [userOne] });
    nock(baseUrl).post('/guests').reply(200, { success: true, data: [guestOne] });

    await new Claim({ ...generateClaim(), user_id: userOne.id }).save();
    await new Claim({ ...generateClaim(), guest_id: guestOne.id }).save();

    const response = await request(app)
      .get('/claims')
      .expect(200);

    const { data: claims } = response.body;
    expect(claims.length).toBe(2);
  });
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

describe('PATCH /claims/:claimId request', () => {
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

  test('Should update claim correctly', async () => {
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: userId } });
    const claimOne = generateClaim();
    await new Claim({ ...claimOne, user_id: userId }).save();

    const editedArrivalTime = '15:30';
    const response = await request(app)
      .patch(`/claims/${claimOne._id}`)
      .set('x-access-token', 'valid token')
      .send({ ...claimOne, arrival_time: editedArrivalTime })
      .expect(200);

    const { data: claim } = response.body;
    expect(claim).toHaveProperty('arrival_time', editedArrivalTime);
    expect(claim).toHaveProperty('type', claimOne.type);
    const claimInDB = await Claim.findById(claimOne._id);
    expect(claimInDB).not.toBeNull();
    expect(claimInDB).toHaveProperty('arrival_time', editedArrivalTime);
  });

  test('Should fail with validation errors', async () => {
    const claimOne = generateClaim();
    await new Claim({ ...claimOne, user_id: userId }).save();

    const response = await request(app)
      .patch(`/claims/${claimOne._id}`)
      .set('x-access-token', 'valid token')
      .send({ ...claimOne, arrival_time: 1000 })
      .expect(400);

    const { errors } = response.body;
    expect(errors).not.toBeNull();
  });

  test('Should fail with validation errors', async () => {
    const claimOne = generateClaim();
    await new Claim({ ...claimOne, user_id: userId }).save();

    const response = await request(app)
      .patch(`/claims/${claimOne._id}`)
      .set('x-access-token', 'valid token')
      .send({ ...claimOne, comment: '1' })
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should fail because claim not found', async () => {
    const claimOne = generateClaim();
    await new Claim({ ...claimOne, user_id: userId }).save();

    const unExistedId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .patch(`/claims/${unExistedId}`)
      .set('x-access-token', 'valid token')
      .send(claimOne)
      .expect(404);

    const { error } = response.body;
    expect(error).toBe(ERRORS.CLAIM_NOT_FOUND);
  });

  test('Should fail because you try to update not yours claim', async () => {
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: 'not my id' } });
    const claimOne = generateClaim();
    await new Claim({ ...claimOne, user_id: userId }).save();

    const response = await request(app)
      .patch(`/claims/${claimOne._id}`)
      .set('x-access-token', 'valid token')
      .send(claimOne)
      .expect(403);

    const { error } = response.body;
    expect(error).toBe(ERRORS.UPDATE_NOT_YOURS_CLAIM_ERROR);
  });
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
});
