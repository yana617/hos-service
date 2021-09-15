const { checkSchema } = require('express-validator');

const { ERRORS } = require('../translates');

module.exports = checkSchema({
  from: {
    in: ['query'],
    custom: {
      errorMessage: ERRORS.INVALID_DATE,
      options: (value) => !Number.isNaN(Date.parse(value)),
    },
    optional: true,
  },
  to: {
    in: ['query'],
    custom: {
      errorMessage: ERRORS.INVALID_DATE,
      options: (value) => !Number.isNaN(Date.parse(value)),
    },
    optional: true,
  },
});
