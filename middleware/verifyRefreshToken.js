const jwt = require('jsonwebtoken');
module.exports = async (req, res, next) => {
  try {
    const { email, refreshToken } = req.body;
    const decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (decodedToken.user.email !== email) {
      return res.status(401).json({
        message: 'You are not authorized to refresh this authentication token. Please login again.'
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      message: 'Could not refresh your authorization token. Please login again.'
    });
  }
};