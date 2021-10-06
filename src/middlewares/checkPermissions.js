const { ERRORS } = require('../translates');
const { getPermissions } = require('../services/internal');

module.exports = (permissions) => async (req, res, next) => {
  try {
    const userPermissions = await getPermissions(req.token);

    if (!permissions.every((p) => userPermissions.includes(p))) {
      return res.status(403).json({ success: false, error: ERRORS.FORBIDDEN });
    }

    next();
  } catch (err) {
    res.status(500).json({ success: false, error: ERRORS.FORBIDDEN });
  }
};
