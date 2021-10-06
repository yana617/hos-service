const { checkSchema } = require('express-validator');

const { historyActionTypes, claimTypes } = require('../../database/constants');
const { ERRORS } = require('../../translates');

module.exports = checkSchema({
  action_type: {
    in: ['body'],
    errorMessage: ERRORS.INVALID_ACTION_TYPE,
    isIn: {
      options: [historyActionTypes],
    },
    isString: true,
    exists: true,
  },
  user_from: {
    in: ['body'],
    errorMessage: ERRORS.INVALID_USER_ID,
    isLength: {
      options: { min: 36, max: 36 },
    },
    isString: true,
    optional: true,
  },
  user_to: {
    in: ['body'],
    errorMessage: ERRORS.INVALID_USER_ID,
    isLength: {
      options: { min: 36, max: 36 },
    },
    isString: true,
    optional: true,
  },
  new_role: {
    in: ['body'],
    errorMessage: ERRORS.INVALID_ROLE_NAME,
    isLength: {
      options: { min: 1, max: 30 },
    },
    isString: true,
    optional: true,
  },
  claim_date: {
    in: ['body'],
    errorMessage: ERRORS.INVALID_DATE,
    custom: {
      options: (value) => !Number.isNaN(Date.parse(value)),
    },
    isString: true,
    optional: true,
  },
  claim_type: {
    in: ['body'],
    errorMessage: ERRORS.INVALID_CLAIM_TYPE,
    isIn: {
      options: [claimTypes],
    },
    isString: true,
    optional: true,
  },
});
