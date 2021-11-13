const nock = require('nock');

const authRequired = require('../../middlewares/authRequired');
const { ERRORS } = require('../../translates');
const { setupDatabase } = require('../fixtures/db');

const { DOCKER_AUTH_SERVICE_URL } = process.env;
const baseUrl = `http://${DOCKER_AUTH_SERVICE_URL}:1081/internal`;

beforeEach(setupDatabase);

test('Should fail without token', () => {
  const request = {};
  const response = {
    status: jest.fn().mockImplementation(() => response),
    json: jest.fn(),
  };
  const next = jest.fn();
  authRequired(request, response, next);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(403);

  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith({
    success: false,
    error: ERRORS.TOKEN_REQUIRED,
  });
});

test('Should fail if response success is false', async () => {
  nock(baseUrl).get('/auth').reply(401, { success: false });

  const request = {
    token: 'invalid token',
  };
  const response = {
    status: jest.fn().mockImplementation(() => response),
    json: jest.fn(),
  };
  const next = jest.fn();
  await authRequired(request, response, next);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(401);

  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith({
    success: false,
    error: ERRORS.AUTH_REQUIRED,
  });
});

test('Should work correctly if token provided and request returns success true', async () => {
  nock(baseUrl).get('/auth').reply(200, { success: true });

  const request = {
    token: 'valid token',
  };
  const response = {};
  const next = jest.fn();
  await authRequired(request, response, next);
  expect(next).toHaveBeenCalledTimes(1);
  nock.cleanAll();
});
