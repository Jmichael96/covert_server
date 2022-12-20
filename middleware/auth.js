const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
  console.log('========>>>>>> INSIDE MIDDLEWARE FOR AUTH')
  // Get token from header
  const token = req.header('x-auth-token') || req.headers.authorization.replace('Bearer ', '') ;
  // console.log(token)
  // Check if not token
  if (!token) {
    return res.status(401).json({ message: 'You are not authorized!' });
  }

  // Verify token
  try {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        console.log(error);
        return res.status(401).json({ message: 'Token is invalid' });
      }
      else {
        req.user = decoded.user;
        console.log('THIS IS THE MIDDLESWARE JWT AUTH ', req.user);
        next();
      }
    });
  } catch (err) {
    return res.status(500).json({ message: `Server Error: ${err.message}` });
  }
};