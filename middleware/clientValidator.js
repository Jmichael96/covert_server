module.exports = validateClient = async (req, res, next) => {
  let client_id = req.header('client-id');
  let client_secret = req.header('client-secret');
  
  if (!client_id || !client_secret) {
      return res.status(401).json({
          serverMsg: 'Please make sure you have the correct headers'
      });
  }
  if (client_id !== process.env.CLIENT_ID) {
      return res.status(401).json({
          serverMsg: 'Please make sure you have the correct headers'
      });
  } else if (client_secret !== process.env.CLIENT_SECRET) {
      return res.status(401).json({
          serverMsg: 'Please make sure you have the correct headers'
      });
  }
  next();
};