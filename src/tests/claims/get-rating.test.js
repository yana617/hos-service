const request = require('supertest');
const nock = require('nock');

const Claim = require('../../models/claim');
const {
  generateClaim,
  generateUser,
  setupDatabase,
} = require('../fixtures/db');
const app = require('../../../app');

jest.mock('../../services/historyAction');

const { DOCKER_AUTH_SERVICE_URL } = process.env;
const baseUrl = `http://${DOCKER_AUTH_SERVICE_URL}/internal`;

const userOne = generateUser();
const userTwo = generateUser();
const userThree = generateUser();

beforeEach(async () => {
  await setupDatabase();
  nock.cleanAll();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /claims/rating request', () => {
  const getDateExcludeMonth = (monthCount) => new Date(
    new Date().setMonth(new Date().getMonth() - monthCount),
  );

  beforeEach(() => {
    nock(baseUrl)
      .post('/users')
      .reply(200, {
        success: true,
        data: [{ id: userOne.id }, { id: userTwo.id }],
      });
    nock(baseUrl)
      .post('/guests')
      .reply(200, {
        success: true,
        data: [],
      });
  });

  test('Should return rating correctly', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['VIEW_RATING'] });

    await new Claim({ ...generateClaim(), user_id: userOne.id }).save();
    await new Claim({ ...generateClaim(), user_id: userTwo.id }).save();

    const response = await request(app)
      .get('/claims/rating')
      .set('x-access-token', 'valid token')
      .expect(200);

    const { data: { allTime, year, month } } = response.body;
    expect(allTime.length).toBe(2);
    expect(year.length).toBe(2);
    expect(month.length).toBe(2);
  });

  test('Should return rating correctly with different claims count', async () => {
    nock.cleanAll();
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['VIEW_RATING'] });

    await new Claim({ ...generateClaim(getDateExcludeMonth(20)), user_id: userOne.id }).save();
    await new Claim({ ...generateClaim(getDateExcludeMonth(15)), user_id: userOne.id }).save();
    await new Claim({ ...generateClaim(getDateExcludeMonth(10)), user_id: userOne.id }).save();
    await new Claim({ ...generateClaim(getDateExcludeMonth(5)), user_id: userTwo.id }).save();
    await new Claim({ ...generateClaim(getDateExcludeMonth(0)), user_id: userTwo.id }).save();

    nock(baseUrl)
      .post('/users')
      .reply(200, {
        success: true,
        data: [{ id: userOne.id }, { id: userTwo.id }],
      });

    const response = await request(app)
      .get('/claims/rating')
      .set('x-access-token', 'valid token')
      .expect(200);

    const { data: { allTime, year, month } } = response.body;

    expect(allTime.length).toBe(2);

    expect(allTime[0].id).toBe(userOne.id);
    expect(allTime[0].claimsCount).toBe(3);
    expect(allTime[1].id).toBe(userTwo.id);
    expect(allTime[1].claimsCount).toBe(2);

    expect(year.length).toBe(2);

    expect(year[0].id).toBe(userTwo.id);
    expect(year[0].claimsCount).toBe(2);
    expect(year[1].id).toBe(userOne.id);
    expect(year[1].claimsCount).toBe(1);

    expect(month.length).toBe(1);

    expect(month[0].id).toBe(userTwo.id);
    expect(month[0].claimsCount).toBe(1);
  });

  test('Should return rating correctly by dates', async () => {
    nock.cleanAll();
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['VIEW_RATING'] });

    await new Claim({ ...generateClaim(getDateExcludeMonth(24)), user_id: userOne.id }).save();
    await new Claim({ ...generateClaim(getDateExcludeMonth(6)), user_id: userTwo.id }).save();

    await new Claim({ ...generateClaim(), user_id: userThree.id }).save();

    nock(baseUrl)
      .post('/users')
      .reply(200, {
        success: true,
        data: [{ id: userOne.id }, { id: userTwo.id }, { id: userThree.id }],
      });

    const response = await request(app)
      .get('/claims/rating')
      .set('x-access-token', 'valid token')
      .expect(200);

    const { data: { allTime, year, month } } = response.body;
    expect(allTime.length).toBe(3);
    expect(year.length).toBe(2);
    expect(month.length).toBe(1);
  });

  test('Should return rating correctly by users', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['VIEW_RATING'] });

    await new Claim({ ...generateClaim(getDateExcludeMonth(24)), user_id: userOne.id }).save();
    await new Claim({ ...generateClaim(getDateExcludeMonth(6)), user_id: userOne.id }).save();

    const thirdClaim = { ...generateClaim(), user_id: userTwo.id };
    await new Claim(thirdClaim).save();

    const response = await request(app)
      .get('/claims/rating')
      .set('x-access-token', 'valid token')
      .expect(200);

    const { data: { allTime, year, month } } = response.body;
    expect(allTime.length).toBe(2);
    expect(year.length).toBe(2);
    expect(month.length).toBe(1);

    expect(month[0].id).toBe(thirdClaim.user_id);
  });

  test('Should map users into claims correctly', async () => {
    nock.cleanAll();
    nock(baseUrl).post('/users').reply(200, { success: true, data: [userOne] });
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['VIEW_RATING'] });

    await new Claim({ ...generateClaim(), user_id: userOne.id }).save();

    const response = await request(app)
      .get('/claims/rating')
      .set('x-access-token', 'valid token')
      .expect(200);

    const { data: { allTime, year, month } } = response.body;
    expect(allTime.length).toBe(1);
    expect(year.length).toBe(1);
    expect(month.length).toBe(1);

    const received = month[0];
    expect(received.id).toBe(userOne.id);
    expect(received.fullName).toBe(`${userOne.name} ${userOne.surname}`);
    expect(received.claimsCount).toBe(1);
  });

  test('Should return users with last created claim first', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['VIEW_RATING'] });

    await new Claim({ ...generateClaim(getDateExcludeMonth(30)), user_id: userOne.id }).save();
    await new Claim({ ...generateClaim(getDateExcludeMonth(6)), user_id: userTwo.id }).save();
    await new Claim({ ...generateClaim(getDateExcludeMonth(26)), user_id: userOne.id }).save();
    await new Claim({ ...generateClaim(getDateExcludeMonth(20)), user_id: userTwo.id }).save();

    const response = await request(app)
      .get('/claims/rating')
      .set('x-access-token', 'valid token')
      .expect(200);

    const { data: { allTime } } = response.body;
    expect(allTime.length).toBe(2);

    expect(allTime[0].id).toBe(userTwo.id);
    expect(allTime[0].claimsCount).toBe(2);
    expect(allTime[1].id).toBe(userOne.id);
    expect(allTime[1].claimsCount).toBe(2);
  });

  test('Should return users with last created claim first', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['VIEW_RATING'] });

    await new Claim({ ...generateClaim(getDateExcludeMonth(20)), user_id: userOne.id }).save();
    await new Claim({ ...generateClaim(getDateExcludeMonth(6)), user_id: userTwo.id }).save();
    await new Claim({ ...generateClaim(getDateExcludeMonth(13)), user_id: userTwo.id }).save();
    await new Claim({ ...generateClaim(getDateExcludeMonth(10)), user_id: userOne.id }).save();

    const response = await request(app)
      .get('/claims/rating')
      .set('x-access-token', 'valid token')
      .expect(200);

    const { data: { allTime, year, month } } = response.body;
    expect(allTime.length).toBe(2);
    expect(year.length).toBe(2);
    expect(month.length).toBe(0);

    expect(allTime[0].id).toBe(userTwo.id);
    expect(allTime[0].claimsCount).toBe(2);
    expect(allTime[1].id).toBe(userOne.id);
    expect(allTime[0].claimsCount).toBe(2);

    expect(year[0].id).toBe(userTwo.id);
    expect(year[0].claimsCount).toBe(1);
    expect(year[1].id).toBe(userOne.id);
    expect(year[0].claimsCount).toBe(1);
  });

  test('Should fail without auth', async () => {
    nock(baseUrl).get('/auth').reply(401, { success: false });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['VIEW_RATING'] });

    const response = await request(app)
      .get('/claims/rating')
      .expect(403);

    const { success } = response.body;
    expect(success).toBeFalsy();
  });

  test('Should fail with not enough permissions', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: [] });

    const response = await request(app)
      .get('/claims/rating')
      .set('x-access-token', 'valid token')
      .expect(403);

    const { success } = response.body;
    expect(success).toBeFalsy();
  });
});
