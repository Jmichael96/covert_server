const formatMessage = require('../services/formatMessage');
const sendText = require('../services/twilio');
const sendEmail = require('../../services/nodemailer');

module.exports = async (req, res, next) => {
  const { 
    reminderType,
    alertDaysPrior, 
    dateDue,  
    reminderMessage,
    repeat,
  } = req.body;

  const user = res.user;

  let newMsg = formatMessage(reminderType, { userName: user.name, dateDue, reminderMessage, repeat, alertDaysPrior });

  if (reminderType === 'phone') {
    await sendText(user.phone, newMsg);
  } else if (reminderType === 'email') {
    await sendEmail(user.email, 'Reminder', newMsg);
  }

  next();
};