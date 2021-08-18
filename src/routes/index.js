const router = require('express').Router();

const noticesRoute = require('./notices');

router.use('/notices', noticesRoute);

module.exports = router;
