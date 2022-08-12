const moment = require('moment');
const mtz = require('moment-timezone');
const { dynamic_notif, non_dynamic_notif } = require('./decodeNotify');

module.exports = (date, notify, alert_days_prior) => {
  // get minutes and convert hours to utc
  let convertedToUTC = mtz.tz(date, 'UTC');
  const minutes = moment(convertedToUTC).minute();
  const hours = moment(convertedToUTC).hours();
  let concatJob = `${minutes} ${hours}`;

  if (non_dynamic_notif[notify]) {
    
    return concatJob += non_dynamic_notif[notify];
  } else {
    return concatJob += dynamic_notif[notify](convertedToUTC, alert_days_prior);
  }
};
