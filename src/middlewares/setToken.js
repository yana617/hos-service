module.exports = (req, res, next) => {
  req.token = req.body.token || req.query.token || req.headers['x-access-token'];
  next();
};
