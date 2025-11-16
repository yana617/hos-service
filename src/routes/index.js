const router = require('express').Router();

const noticesRoute = require('./notices');
const historyActionsRoute = require('./history-actions');
const claimsRoute = require('./claims');
const usersRoute = require('./users');
const statsRoute = require('./stats');

router.use('/notices', noticesRoute);
router.use('/history-actions', historyActionsRoute);
router.use('/claims', claimsRoute);
router.use('/users', usersRoute);
router.use('/stats', statsRoute);

module.exports = router;
