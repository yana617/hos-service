const route = require('express').Router();

const authRequired = require('../middlewares/authRequired');
const errorHandler = require('../middlewares/errorHandler');
const statsController = require('../controllers/stats.controller');

route.get(
  '/users-per-month',
  authRequired,
  errorHandler(statsController.getUsersPerMonthStats),
);

module.exports = route;
