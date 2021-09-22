const route = require('express').Router();

const validateClaim = require('../middlewares/validations/validateClaim');
const checkValidationErrors = require('../middlewares/checkValidation');
const checkUserForClaim = require('../middlewares/checkUserForClaim');
const claimController = require('../controllers/claim.controller');
const authRequired = require('../middlewares/authRequired');
const validateClaimsQueries = require('../middlewares/validations/validateClaimsQueries');
const errorHandler = require('../middlewares/errorHandler');

route.get('/', validateClaimsQueries, checkValidationErrors, errorHandler(claimController.getClaims));
route.post('/', authRequired, validateClaim, checkValidationErrors, checkUserForClaim,
  errorHandler(claimController.createClaim));
route.put('/:id', authRequired, validateClaim, checkValidationErrors, errorHandler(claimController.updateClaim));
route.delete('/:id', authRequired, errorHandler(claimController.deleteClaim));

module.exports = route;
