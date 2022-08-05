const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.headers.authorization.replace('Bearer ', '');

  // Check if not token
  if (!token) {
    return res.status(401).json({ message: 'You are not authorized!' });
  }

  // Verify token
  try {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(401).json({ message: 'Token is invalid' });
      }
      else {
        console.log(decoded.user);
        req.user = decoded.user;
        next();
      }
    });
  } catch (err) {
    return res.status(500).json({ message: `Server Error: ${err.message}` });
  }
};