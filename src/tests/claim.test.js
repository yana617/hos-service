const request = require('supertest');
const nock = require('nock');

const Claim = require('../models/claim');
const { generateClaim, setupDatabase } = require('./fixtures/db');
const app = require('../../app');
// const { ERRORS } = require('../translates');

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
