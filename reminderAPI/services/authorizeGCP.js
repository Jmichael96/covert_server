const { google } = require("googleapis");

module.exports = async () => {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  return await auth.getClient();
};