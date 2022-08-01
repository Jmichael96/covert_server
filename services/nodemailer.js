const NODEMAIL_EMAIL = process.env.NODEMAILER_EMAIL;
const NODEMAIL_APP_PASS = process.env.NODEMAILER_APP_PASSWORD;
const nodemailer = require('nodemailer');

const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
      user: NODEMAIL_EMAIL,
      pass: NODEMAIL_APP_PASS
  }
};

const transporter = nodemailer.createTransport(smtpConfig);

module.exports = async (email, subject, html) => {
  let mailOptions = {
    from: `Covert_Server ${NODEMAIL_EMAIL}`,
    bcc: email,
    subject: subject,
    html: html
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.error(error);
        throw new Error(`There was an error in Nodemailer ${error.message}`);
    } else {
        console.log('Email sent: ' + info.response);
    }
});
};