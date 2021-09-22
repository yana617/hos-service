const { checkSchema } = require('express-validator');

const { claimTypes } = require('../../database/constants');
const { ERRORS } = require('../../translates');

module.exports = checkSchema({
  date: {
    in: ['body'],
    custom: {
      errorMessage: ERRORS.INVALID_DATE,
      options: (value) => !Number.isNaN(Date.parse(value)),
    },
    exists: true,
  },
  type: {
    in: ['body'],
    isIn: {
      options: [claimTypes],
      errorMessage: ERRORS.INVALID_CLAIM_TYPE,
    },
    exists: true,
  },
  user_id: {
    in: ['body'],
    isUUID: {
      errorMessage: 'user_id must be a uuid',
    },
    isLength: {
      errorMessage: ERRORS.INVALID_USER_ID,
      options: { min: 36, max: 36 },
    },
    exists: true,
  },
  arrival_time: {
    in: ['body'],
    errorMessage: ERRORS.INVALID_ARRIVAL_TIME,
    isString: true,
    optional: { options: { nullable: true } },
  },
  additional_people: {
    in: ['body'],
    errorMessage: ERRORS.ADDITIONAL_PEOPLE_ERROR,
    isNumeric: true,
    optional: { options: { nullable: true } },
  },
  comment: {
    in: ['body'],
    errorMessage: ERRORS.INVALID_COMMENT,
    isString: true,
    isLength: {
      errorMessage: ERRORS.COMMENT_LENGTH_ERROR,
      options: { min: 10, max: 300 },
    },
    optional: { options: { nullable: true } },
  },
  questionable: {
    in: ['body'],
    errorMessage: ERRORS.INVALID_QUESTIONABLE,
    isBoolean: true,
    optional: { options: { nullable: true } },
  },
  guest: {
    in: ['body'],
    isObject: {
      errorMessage: ERRORS.GUEST_FIELD_ERROR,
      bail: true,
    },
    optional: { options: { nullable: true } },
  },
  'guest.name': {
    trim: true,
    isLength: {
      errorMessage: ERRORS.NAME_FIELD_ERROR,
      options: { min: 2, max: 30 },
    },
    isString: {
      errorMessage: ERRORS.NAME_FIELD_TYPE_ERROR,
      bail: true,
    },
    exists: true,
    optional: true,
  },
  'guest.surname': {
    trim: true,
    isLength: {
      errorMessage: ERRORS.SURNAME_FIELD_ERROR,
      options: { min: 2, max: 30 },
    },
    isString: {
      errorMessage: ERRORS.SURNAME_FIELD_TYPE_ERROR,
      bail: true,
    },
    exists: true,
    optional: true,
  },
  'guest.phone': {
    trim: true,
    isLength: {
      errorMessage: ERRORS.PHONE_FIELD_ERROR,
      options: { min: 12, max: 12 },
    },
    exists: true,
    optional: true,
  },
});
