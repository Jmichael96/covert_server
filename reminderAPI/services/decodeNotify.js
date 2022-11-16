const moment = require('moment');
const dynamic_notif = {
  'weekly': (date, days_prior) => {
    let modifiedDate = moment(date).subtract(days_prior, 'days');
    const dayOfWeek = moment(modifiedDate).day();  
    return ` * * ${dayOfWeek}`;
  },
  'bi-weekly': (date, days_prior) => {
    let modifiedDate = moment(date).subtract(days_prior, 'days');
    const dayOfWeek = moment(modifiedDate).day();  
    return ` */2 * ${dayOfWeek}`;
  },
  'monthly': (date, days_prior) => {
    let modifiedDate = moment(date).subtract(days_prior, 'days');
    const dayOfMonth = moment(modifiedDate).date();
    return ` ${dayOfMonth} * *`;
  },
  'yearly': (date, days_prior) => {
    let modifiedDate = moment(date).subtract(days_prior, 'days');
    const dayOfMonth = moment(modifiedDate).date();
    const month = moment(modifiedDate).month() + 1;
    return ` ${dayOfMonth} ${month} *`;
  },
  'on due date': (date) => {
    const dayOfMonth = moment(date).date();
    const month = moment(date).month() + 1;
    return ` ${dayOfMonth} ${month} *`;
  },
};

const non_dynamic_notif = {
  '1st of every month': ' 1 * *',
  '15th of every month': ' 15 * *',
  'daily': ' */1 * *',
};

module.exports = {
  dynamic_notif,
  non_dynamic_notif
};