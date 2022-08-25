const formatMessage = require('../services/formatMessage');
const sendText = require('../services/twilio');
const sendEmail = require('../../services/nodemailer');

module.exports = async (req, res, next) => {
  const { 
    reminder_type,
    alert_days_prior, 
    date_due,  
    reminder_message,
    repeat,
  } = req.body;

  const user = res.user;

  let newMsg = formatMessage(reminder_type, { userName: user.name, date_due, reminder_message, repeat, alert_days_prior });

  if (reminder_type === 'phone') {
    await sendText(user.phone, newMsg);
  } else if (reminder_type === 'email') {
    await sendEmail(user.email, 'Reminder', newMsg);
  }

  next();
};