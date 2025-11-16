const request = require('supertest');
const nock = require('nock');
const { v4 } = require('uuid');
const mongoose = require('mongoose');

const Claim = require('../../models/claim');
const { generateClaim, setupDatabase } = require('../fixtures/db');
const app = require('../../../app');

jest.mock('../../services/historyAction');

const { DOCKER_AUTH_SERVICE_URL } = process.env;
const baseUrl = `http://${DOCKER_AUTH_SERVICE_URL}/internal`;

const userId1 = v4();
const userId2 = v4();
const userId3 = v4();

const today = new Date();
const claims = [];

for (let i = 0; i < 12; i++) {
  const claimDate = new Date(today);
  claimDate.setMonth(today.getMonth() - i);

  claims.push({
    ...generateClaim(),
    // eslint-disable-next-line no-nested-ternary
    user_id: i < 2 ? userId1 : i < 6 ? userId2 : userId3,
    date: claimDate,
  });
}

beforeEach(async () => {
  await setupDatabase();
  nock.cleanAll();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /stats/users-per-month request', () => {
  test('Should return stats successfully', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });

    await Promise.all(claims.map((claim) => new Claim(claim).save()));

    const response = await request(app)
      .get('/stats/users-per-month')
      .set('x-access-token', 'valid token')
      .expect(200);

    const { data: stats } = response.body;
    expect(stats.length).toBe(12);
    stats.forEach((month) => {
      expect(month.usersCount).toBe(1);
    });

    await Claim.deleteMany();
  });

  test('Should return stats with zero months successfully', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });

    await new Claim(claims[11]).save();
    await new Claim(claims[10]).save();
    await new Claim({
      ...claims[0],
      user_id: userId1,
      _id: new mongoose.Types.ObjectId(),
    }).save();
    await new Claim({
      ...claims[0],
      user_id: userId2,
      _id: new mongoose.Types.ObjectId(),
    }).save();
    await new Claim({
      ...claims[0],
      user_id: userId3,
      _id: new mongoose.Types.ObjectId(),
    }).save();

    const response = await request(app)
      .get('/stats/users-per-month')
      .set('x-access-token', 'valid token')
      .expect(200);

    const { data: stats } = response.body;
    expect(stats.length).toBe(12);
    expect(stats[0].usersCount).toBe(1);
    expect(stats[1].usersCount).toBe(1);
    expect(stats[2].usersCount).toBe(0);
    expect(stats[3].usersCount).toBe(0);
    expect(stats[4].usersCount).toBe(0);
    expect(stats[10].usersCount).toBe(0);
    expect(stats[11].usersCount).toBe(3);

    await Claim.deleteMany();
  });
});
