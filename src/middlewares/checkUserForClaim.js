const { getUser, getPermissions } = require('../services/internal');
const { ERRORS } = require('../translates');

module.exports = async (req, res, next) => {
  const { user_id, guest: { phone } = {} } = req.body;

  try {
    const user = await getUser(req.token);
    if (user_id !== user.id) {
      return res.status(403).json({ success: false, error: ERRORS.CREATE_NOT_YOURS_CLAIM_ERROR });
    }
    const permissions = await getPermissions(req.token);
    if (!permissions.includes('CREATE_CLAIM')) {
      return res.status(403).json({ success: false, error: ERRORS.FORBIDDEN });
    }

    // guest
    if (phone && !permissions.includes('CREATE_CLAIM_FOR_UNREGISTERED_USERS')) {
      return res.status(403).json({ success: false, error: ERRORS.FORBIDDEN });
    }
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }

  next();
};
