const route = require('express').Router();

const validateHistoryAction = require('../middlewares/validations/validateHistoryAction');
const historyActionController = require('../controllers/historyAction.controller');
const checkValidationErrors = require('../middlewares/checkValidation');
const checkEventKey = require('../middlewares/checkEventKey');

route.post('/', checkEventKey, validateHistoryAction, checkValidationErrors, historyActionController.createAction);
route.get('/', historyActionController.getActions);

module.exports = route;
