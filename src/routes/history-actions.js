const route = require('express').Router();

const validateHistoryAction = require('../middlewares/validations/validateHistoryAction');
const historyActionController = require('../controllers/historyAction.controller');
const checkValidationErrors = require('../middlewares/checkValidation');
const checkEventKey = require('../middlewares/checkEventKey');
const checkPermissions = require('../middlewares/checkPermissions');

route.post('/', checkEventKey, validateHistoryAction, checkValidationErrors, historyActionController.createAction);
route.get('/', checkPermissions(['CREATE_CLAIM']), historyActionController.getActions);

module.exports = route;
