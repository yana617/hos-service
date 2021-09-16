const route = require('express').Router();

const validateNotice = require('../middlewares/validateNotice');
const authRequired = require('../middlewares/authRequired');
const checkPermissions = require('../middlewares/checkPermissions');
const noticeController = require('../controllers/notice.controller');

route.post('/', authRequired, checkPermissions(['CREATE_NOTICE']), validateNotice, noticeController.createNotice);
route.get('/:id', noticeController.getNotice);
route.get('/', noticeController.getNoticesIds);
route.put('/:id', authRequired, checkPermissions(['EDIT_NOTICE']), validateNotice, noticeController.updateNotice);
route.delete('/:id', authRequired, checkPermissions(['DELETE_NOTICE']), noticeController.deleteNotice);

module.exports = route;
