const checkEventKey = require('../../middlewares/checkEventKey');
const { ERRORS } = require('../../translates');
const { setupDatabase } = require('../fixtures/db');

const { EVENT_KEY } = process.env;

beforeEach(setupDatabase);

test('Should fail with incorrect event key', () => {
  const request = {
    headers: {},
  };
  const response = {
    status: jest.fn().mockImplementation(() => response),
    json: jest.fn(),
  };
  const next = jest.fn();
  checkEventKey(request, response, next);
  expect(response.status).toHaveBeenCalledTimes(1);
  expect(response.status).toHaveBeenCalledWith(403);

  expect(response.json).toHaveBeenCalledTimes(1);
  expect(response.json).toHaveBeenCalledWith({
    success: false,
    error: ERRORS.FORBIDDEN,
  });
});

test('Should work correctly if event key is correct', () => {
  const request = {
    headers: {
      'event-key': EVENT_KEY,
    },
  };
  const response = {};
  const next = jest.fn();
  checkEventKey(request, response, next);
  expect(next).toHaveBeenCalledTimes(1);
});
