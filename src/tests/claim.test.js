const request = require('supertest');
const nock = require('nock');
const mongoose = require('mongoose');

const Claim = require('../models/claim');
const { generateClaim, setupDatabase } = require('./fixtures/db');
const app = require('../../app');
const { ERRORS } = require('../translates');

const { AUTH_SERVICE_URL } = process.env;
const baseUrl = `http://${AUTH_SERVICE_URL}:1081/internal`;

beforeEach(setupDatabase);

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

    const response = await request(app)
      .get('/claims')
      .expect(200);

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
});

const userId = 'my id';
describe('PUT /claims/:claimId request', () => {
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
      .put(`/claims/${claimOne._id}`)
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
      .put(`/claims/${claimOne._id}`)
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
      .put(`/claims/${claimOne._id}`)
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
      .put(`/claims/${unExistedId}`)
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
      .put(`/claims/${claimOne._id}`)
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

    const response = await request(app)
      .delete(`/claims/${claimOne._id}`)
      .set('x-access-token', 'valid token')
      .expect(200);

    const { data: claim } = response.body;
    expect(claim).toHaveProperty('type', claimOne.type);
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
    nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: 'not my id' } });
    const claimOne = generateClaim();
    await new Claim({ ...claimOne, user_id: userId }).save();

    const response = await request(app)
      .delete(`/claims/${claimOne._id}`)
      .set('x-access-token', 'valid token')
      .expect(403);

    const { error } = response.body;
    expect(error).toBe(ERRORS.DELETE_NOT_YOURS_CLAIM_ERROR);
  });
});
