const router = require('express').Router();

const noticesRoute = require('./notices');
const claimsRoute = require('./claims');

router.use('/notices', noticesRoute);
router.use('/claims', claimsRoute);

module.exports = router;
