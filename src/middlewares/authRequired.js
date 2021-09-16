const { ERRORS } = require('../translates');
const { checkAuth } = require('../services/internal');

module.exports = async (req, res, next) => {
  try {
    if (!req.token) {
      return res.status(403).json({ success: false, error: ERRORS.TOKEN_REQUIRED });
    }

    const { success } = await checkAuth(req.token);
    if (!success) {
      return res.status(401).json({ success: false, error: ERRORS.AUTH_REQUIRED });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: ERRORS.AUTH_REQUIRED });
  }
};
