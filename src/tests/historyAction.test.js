const request = require('supertest');
const nock = require('nock');

const HistoryAction = require('../models/historyAction');
const { setupDatabase, generateHistoryAction } = require('./fixtures/db');
const app = require('../../app');
const { ERRORS } = require('../translates');
const { emitter } = require('../utils/historyActionEmitter');

const { AUTH_SERVICE_URL, EVENT_KEY } = process.env;
const baseUrl = `http://${AUTH_SERVICE_URL}:1081/internal`;

jest.mock('../utils/historyActionEmitter');

beforeEach(async () => {
  await setupDatabase();
  nock.cleanAll();
});

describe('GET /history-actions request', () => {
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

  test('Should return history actions correctly', async () => {
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['CREATE_CLAIM'] });
    await new HistoryAction(generateHistoryAction()).save();
    await new HistoryAction(generateHistoryAction()).save();

    const response = await request(app)
      .get('/history-actions')
      .expect(200);

    const { data: { historyActions, total } } = response.body;
    expect(historyActions.length).toBe(2);
    expect(total).toBe(2);
  });

  test('Should return empty array', async () => {
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['CREATE_CLAIM'] });
    const response = await request(app)
      .get('/history-actions')
      .expect(200);

    const { data: { historyActions, total } } = response.body;
    expect(historyActions.length).toBe(0);
    expect(total).toBe(0);
  });

  test('Should fail with not enough permissions for guest creation', async () => {
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: [] });

    const response = await request(app)
      .get('/history-actions')
      .expect(403);

    const { error } = response.body;
    expect(error).toBe(ERRORS.FORBIDDEN);
  });
});

describe('POST /history-actions request', () => {
  test('Should call history action emitter correctly', async () => {
    const historyActionOne = generateHistoryAction();

    const emitHistoryActionMock = jest.spyOn(emitter, 'emit');
    const response = await request(app)
      .post('/history-actions')
      .set('event-key', EVENT_KEY)
      .send(historyActionOne)
      .expect(200);

    const { success } = response.body;
    expect(success).toBeTruthy();

    expect(emitHistoryActionMock).toHaveBeenCalledTimes(1);
  });
});
