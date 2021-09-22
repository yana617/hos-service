const route = require('express').Router();

const userController = require('../controllers/user.controller');
const authRequired = require('../middlewares/authRequired');
const errorHandler = require('../middlewares/errorHandler');

route.get('/:userId/claims', authRequired, errorHandler(userController.getUserClaims));

module.exports = route;
