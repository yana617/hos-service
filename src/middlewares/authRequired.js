const { ERRORS } = require('../translates');
const { checkAuth } = require('../api/authService');

module.exports = async (req, res, next) => {
  try {
    if (!req.token) {
      return res.status(403).json({ success: false, error: ERRORS.TOKEN_REQUIRED });
    }

    try {
      await checkAuth(req.token);
    } catch (e) {
      return res.status(401).json({ success: false, error: ERRORS.AUTH_REQUIRED });
    }

    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: ERRORS.AUTH_REQUIRED });
  }
};
