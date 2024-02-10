const request = require('supertest');
const nock = require('nock');
const { v4 } = require('uuid');

const Claim = require('../../models/claim');
const {
  generateClaim,
  generateUser,
  setupDatabase,
  generateGuest,
} = require('../fixtures/db');
const app = require('../../../app');

jest.mock('../../services/historyAction');
const historyActionService = require('../../services/historyAction');

const { DOCKER_AUTH_SERVICE_URL } = process.env;
const baseUrl = `http://${DOCKER_AUTH_SERVICE_URL}/internal`;

const userId = v4();
const generateClaimWithPresetUserId = (date = null) => ({
  ...generateClaim(date),
  user_id: userId,
});

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
        data: [{ id: userId }],
      });
    nock(baseUrl)
      .post('/guests')
      .reply(200, {
        success: true,
        data: [],
      });
  });

  test('Should return claims correct', async () => {
    await new Claim(generateClaimWithPresetUserId()).save();
    await new Claim(generateClaimWithPresetUserId()).save();

    const onClaimActionSpy = jest.spyOn(historyActionService, 'onClaimAction');

    const response = await request(app)
      .get('/claims')
      .expect(200);

    expect(onClaimActionSpy).toHaveBeenCalledTimes(0);

    const { data: claims } = response.body;
    expect(claims.length).toBe(2);
  });

  test('Should return claims with from query only', async () => {
    await new Claim(generateClaimWithPresetUserId('2021-09-10')).save();
    await new Claim(generateClaimWithPresetUserId('2021-09-15')).save();

    const from = '2021-09-12';
    const response = await request(app)
      .get(`/claims?from=${from}`)
      .expect(200);

    const { data: claims } = response.body;
    expect(claims.length).toBe(1);
  });

  test('Should return claims with to query only', async () => {
    await new Claim(generateClaimWithPresetUserId('2021-09-10')).save();
    await new Claim(generateClaimWithPresetUserId('2021-09-11')).save();
    await new Claim(generateClaimWithPresetUserId('2021-09-15')).save();

    const to = '2021-09-12';
    const response = await request(app)
      .get(`/claims?to=${to}`)
      .expect(200);

    const { data: claims } = response.body;
    expect(claims.length).toBe(2);
  });

  test('Should return claims with from & to queries correctly', async () => {
    await new Claim(generateClaimWithPresetUserId('2021-09-10')).save();
    await new Claim(generateClaimWithPresetUserId('2021-09-12')).save();
    await new Claim(generateClaimWithPresetUserId('2021-09-15')).save();

    const from = '2021-09-11';
    const to = '2021-09-13';
    const response = await request(app)
      .get(`/claims?from=${from}&to=${to}`)
      .expect(200);

    const { data: claims } = response.body;
    expect(claims.length).toBe(1);
  });

  test('Should fail with invalid date', async () => {
    await new Claim(generateClaimWithPresetUserId('2021-09-10')).save();

    const from = 'invalid';
    const response = await request(app)
      .get(`/claims?from=${from}`)
      .expect(400);

    const { errors } = response.body;
    expect(errors).toBeDefined();
  });

  test('Should successfully set users', async () => {
    const userOne = generateUser();
    const userTwo = generateUser();
    const guestOne = generateGuest();
    nock.cleanAll();
    nock(baseUrl).post('/users').reply(200, { success: true, data: [userOne, userTwo] });
    nock(baseUrl).post('/guests').reply(200, { success: true, data: [guestOne] });

    await new Claim({ ...generateClaim(), user_id: userOne.id }).save();
    await new Claim({ ...generateClaim(), guest_id: guestOne.id, user_id: userTwo.id }).save();

    const response = await request(app)
      .get('/claims')
      .expect(200);

    const { data: claims } = response.body;
    expect(claims.length).toBe(2);
  });
});
