const { checkSchema } = require('express-validator');

const { ERRORS } = require('../../translates');

module.exports = checkSchema({
  title: {
    in: ['body'],
    isLength: {
      errorMessage: ERRORS.NOTICE_INVALID_TITLE,
      options: { min: 2, max: 100 },
    },
    exists: true,
  },
  description: {
    in: ['body'],
    isLength: {
      errorMessage: ERRORS.NOTICE_INVALID_DESCRIPTION,
      options: { min: 50, max: 500 },
    },
    exists: true,
  },
  internalOnly: {
    in: ['body'],
    isBoolean: true,
    exists: true,
  },
});
