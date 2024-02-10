const authServiceApi = require('../api/authService');
const checkPermissions = require('./checkPermissions');
const { ERRORS } = require('../translates');

module.exports = async (req, res, next) => {
  const { user_id, guest: { phone } = {} } = req.body;

  try {
    const user = await authServiceApi.getUser(req.token);
    if (user_id !== user.id) {
      return res.status(403).json({ success: false, error: ERRORS.CREATE_NOT_YOURS_CLAIM_ERROR });
    }
    const permissionsToCheck = ['CREATE_CLAIM'];
    if (phone) {
      permissionsToCheck.push('CREATE_CLAIM_FOR_UNREGISTERED_USERS');
    }
    await checkPermissions(permissionsToCheck)(req, res, () => next());
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};
