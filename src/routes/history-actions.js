const route = require('express').Router();

const validateHistoryAction = require('../middlewares/validateHistoryAction');
const historyActionController = require('../controllers/historyAction.controller');

route.post('/', validateHistoryAction, historyActionController.createAction);
route.get('/', historyActionController.getActions);

module.exports = route;
