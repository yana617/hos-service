const router = require('express').Router();

const noticesRoute = require('./notices');
const historyActionsRoute = require('./history-actions');

router.use('/notices', noticesRoute);
router.use('/history-actions', historyActionsRoute);

module.exports = router;
