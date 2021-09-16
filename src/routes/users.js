const route = require('express').Router();

const userController = require('../controllers/user.controller');
const authRequired = require('../middlewares/authRequired');

route.get('/:userId/claims', authRequired, userController.getUserClaims);

module.exports = route;
