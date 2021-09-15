const route = require('express').Router();
const { validationResult } = require('express-validator');

const validateClaim = require('../middlewares/validateClaim');
const checkUserForClaim = require('../middlewares/checkUserForClaim');
const claimController = require('../controllers/claim.controller');
const authRequired = require('../middlewares/authRequired');
const validateClaimsQueries = require('../middlewares/validateClaimsQueries');

route.get('/', validateClaimsQueries, claimController.getClaims);
route.post('/', authRequired, validateClaim, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}, checkUserForClaim, claimController.createClaim);
route.put('/:id', authRequired, validateClaim, claimController.updateClaim);
route.delete('/:id', authRequired, claimController.deleteClaim);

module.exports = route;
