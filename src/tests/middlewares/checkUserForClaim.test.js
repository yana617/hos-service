const nock = require('nock');

const checkUserForClaim = require('../../middlewares/checkUserForClaim');
const { ERRORS } = require('../../translates');
const { setupDatabase } = require('../fixtures/db');

const { DOCKER_AUTH_SERVICE_URL } = process.env;
const baseUrl = `http://${DOCKER_AUTH_SERVICE_URL}/internal`;

beforeEach(setupDatabase);

test('Should work correctly for volunteer permissions', async () => {
  const userId = 'valid id';
  nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: userId } });
  nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['CREATE_CLAIM'] });

  const request = {
    body: {
      user_id: userId,
    },
    query: {},
    token: 'valid token',
  };
  const response = {};
  const next = jest.fn();
  await checkUserForClaim(request, response, next);
  expect(next).toHaveBeenCalledTimes(1);
});

test('Should fail when you claim not for yourself', async () => {
  nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: 'another id' } });

  const request = {
    body: {
      user_id: 'my id',
    },
    query: {},
    token: 'valid token',
  };
  const response = {
    status: jest.fn().mockImplementation(() => response),
    json: jest.fn(),
  };
  const next = jest.fn();
  await checkUserForClaim(request, response, next);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(403);

  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith({
    success: false,
    error: ERRORS.CREATE_NOT_YOURS_CLAIM_ERROR,
  });
});

test('Should fail when you do not have enough permissions', async () => {
  const userId = 'valid id';
  nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: userId } });
  nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: [] });

  const request = {
    body: {
      user_id: userId,
    },
    query: {},
    token: 'valid token',
  };
  const response = {
    status: jest.fn().mockImplementation(() => response),
    json: jest.fn(),
  };
  const next = jest.fn();
  await checkUserForClaim(request, response, next);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(403);

  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith({
    success: false,
    error: ERRORS.FORBIDDEN,
  });
});

test('Should fail when you do not have enough permissions for create a new claim for guest', async () => {
  const userId = 'valid id';
  nock(baseUrl).get('/users/me').reply(200, { success: true, data: { id: userId } });
  nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['CREATE_CLAIM'] });

  const request = {
    body: {
      user_id: userId,
      guest: {
        phone: '375291111111',
      },
    },
    query: {},
    token: 'valid token',
  };
  const response = {
    status: jest.fn().mockImplementation(() => response),
    json: jest.fn(),
  };
  const next = jest.fn();
  await checkUserForClaim(request, response, next);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(403);

  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith({
    success: false,
    error: ERRORS.FORBIDDEN,
  });
});
