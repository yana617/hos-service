const { checkSchema } = require('express-validator');

module.exports = checkSchema({
  title: {
    in: ['body'],
    isString: true,
    isLength: {
      errorMessage: 'Title should be from 2 to 100 characters',
      options: { min: 2, max: 100 },
    },
    exists: true,
  },
  description: {
    in: ['body'],
    isString: true,
    isLength: {
      errorMessage: 'Description should be from 50 to 500 characters',
      options: { min: 50, max: 500 },
    },
    exists: true,
  },
  authorized: {
    in: ['body'],
    isBoolean: true,
    exists: true,
  },
});
