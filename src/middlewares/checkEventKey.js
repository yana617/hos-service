const { ERRORS } = require('../translates');

const { EVENT_KEY } = process.env;

module.exports = async (req, res, next) => {
  const eventKey = req.headers['event-key'];
  console.log('eventKey', eventKey, EVENT_KEY);
  if (!eventKey || eventKey !== EVENT_KEY) {
    return res.status(403).json({ success: false, error: ERRORS.FORBIDDEN });
  }
  next();
};
