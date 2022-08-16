module.exports = (req, res, next) => {
  let gcp_client_id = req.header('gcp-client-id');
  let gcp_client_secret = req.header('gcp-client-secret');

  if (!gcp_client_id || !gcp_client_secret) {
    return res.status(401).json({
        serverMsg: 'Please make sure you have the correct headers'
    });
  }
  if (gcp_client_id !== process.env.GCP_ID) {
    return res.status(401).json({
        serverMsg: 'Please make sure you have the correct headers'
    });
  } else if (gcp_client_secret !== process.env.GCP_SECRET) {
    return res.status(401).json({
        serverMsg: 'Please make sure you have the correct headers'
    });
  }
  next();
};