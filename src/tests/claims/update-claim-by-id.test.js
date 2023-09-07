const request = require('supertest');
const nock = require('nock');
const mongoose = require('mongoose');
const { v4 } = require('uuid');

const Claim = require('../../models/claim');
const { generateClaim, setupDatabase } = require('../fixtures/db');
const app = require('../../../app');
const { ERRORS } = require('../../translates');

jest.mock('../../services/historyAction');

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
