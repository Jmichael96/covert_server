const moment = require('moment');
const mtz = require('moment-timezone');

module.exports = formatMessage = (reminderType, msgObject) => {
  const curDate = new Date();
  const utcDate = mtz.tz(curDate, 'UTC');

  const { userName, reminder_message, repeat, alert_days_prior } = msgObject;

  if (reminderType === 'phone') {
    return `Hello, ${userName}! This is Covert_Server sending you a reminder message. 
    \n ${reminder_message} \n 
    Date Due: ${alert_days_prior <= 0 ? moment(utcDate).format('ll') : moment(utcDate).add(alert_days_prior, 'days').format('ll')} \n
    ${repeat ? 'Note: This is a re-occuring reminder' : 'Note: This reminder is not re-occuring'}
    `;
  } else if (reminderType === 'email') {
    return `Hello, ${userName}! This is Covert_Server sending you a reminder message. <br />
    ${reminder_message} <br />
    <b>Date Due:</b> ${alert_days_prior <= 0 ? moment(utcDate).format('ll') : moment(utcDate).add(alert_days_prior, 'days').format('ll')}  <br />
    ${repeat ? '<b>Note:</b> This is a re-occuring reminder' : '<b>Note:</b> This reminder is not re-occuring'}`
  }
};
