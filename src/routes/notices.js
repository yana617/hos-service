const route = require('express').Router();

const validateNotice = require('../middlewares/validations/validateNotice');
const authRequired = require('../middlewares/authRequired');
const checkPermissions = require('../middlewares/checkPermissions');
const checkValidationErrors = require('../middlewares/checkValidation');
const noticeController = require('../controllers/notice.controller');
const errorHandler = require('../middlewares/errorHandler');

route.post('/', authRequired, checkPermissions(['CREATE_NOTICE']), validateNotice, checkValidationErrors,
  errorHandler(noticeController.createNotice));
route.get('/:id', errorHandler(noticeController.getNotice));
route.get('/', errorHandler(noticeController.getNoticesIds));
route.put('/:id', authRequired, checkPermissions(['EDIT_NOTICE']), validateNotice, checkValidationErrors,
  errorHandler(noticeController.updateNotice));
route.delete('/:id', authRequired, checkPermissions(['DELETE_NOTICE']), errorHandler(noticeController.deleteNotice));

module.exports = route;
