const request = require('supertest');
const nock = require('nock');
const { v4 } = require('uuid');

const Claim = require('../models/claim');
const { generateClaim, setupDatabase } = require('./fixtures/db');
const app = require('../../app');
const { ERRORS } = require('../translates');

const { DOCKER_AUTH_SERVICE_URL } = process.env;
const baseUrl = `http://${DOCKER_AUTH_SERVICE_URL}/internal`;
const userId = v4();

beforeEach(async () => {
  await setupDatabase();
  nock.cleanAll();
});

describe('GET /users/:userId/claims request', () => {
  test('Should get claims correctly', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    await new Claim({ ...generateClaim(), user_id: userId }).save();
    await new Claim({ ...generateClaim(), user_id: userId }).save();
    await new Claim(generateClaim()).save();

    const response = await request(app)
      .get(`/users/${userId}/claims`)
      .set('x-access-token', 'valid token')
      .expect(200);

    const { data: claims } = response.body;
    expect(claims.length).toBe(2);
  });

  test('Should get only own claims correctly', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    await new Claim({ ...generateClaim(), user_id: userId, guest_id: v4() }).save();
    await new Claim({ ...generateClaim(), user_id: userId }).save();
    await new Claim(generateClaim()).save();

    const response = await request(app)
      .get(`/users/${userId}/claims`)
      .set('x-access-token', 'valid token')
      .expect(200);

    const { data: claims } = response.body;
    expect(claims.length).toBe(1);
  });

  test('Should fail without auth', async () => {
    nock(baseUrl).get('/auth').reply(401, { success: false });
    const claimOne = generateClaim();
    await new Claim({ ...claimOne, user_id: userId }).save();

    const response = await request(app)
      .get(`/users/${userId}/claims`)
      .set('x-access-token', 'valid token')
      .expect(401);

    const { error } = response.body;
    expect(error).toBe(ERRORS.AUTH_REQUIRED);
  });
});
