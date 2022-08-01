const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ serverMsg: 'You are not authorized!' });
  }

  // Verify token
  try {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(401).json({ status: 401, serverMsg: 'Token is invalid' });
      }
      else {
        req.user = decoded.user;
        next();
      }
    });
  } catch (err) {
    return res.status(500).json({ msg: `Server Error: ${err.message}` });
  }
};