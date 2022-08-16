const { isEmpty } = require("jvh-is-empty");
const reminderTypeDict = require("../services/dictionaries/reminderTypeDict");
const moment = require("moment");
const requiredFields = require('../services/dictionaries/requiredReminderFields');
const notifyDict = require('../services/dictionaries/notifyDict');
const notifyReqFields = require('../services/dictionaries/notifyReqFields');

const validateReminderType = (type) => {
  if (!reminderTypeDict[type]) return false;
  return true;
};

const validateDate = (date) => {
  if (!moment(date, "YYYY-MM-DD", true).isValid()) return false;
  return true;
};

const validateRepeat = (repeatType) => {
  return repeatType === false || repeatType === true;
};

const validateTime = (time) => moment(time, 'H:mm', true).isValid();

const validateNotify = (dictNum) => {
  if (!notifyDict[dictNum]) return false;
  return true;
};

const validateAlertDays = (num) => {
  if (typeof(num) !== 'number' || num < 0) return false;
  return true;
};

module.exports = {
  validateReminder: async (req, res, next) => {
    
    // check for empty field values
    for (let key in req.body) {
      if (isEmpty(req.body[key])) {
        return res.status(406).json({
          message: `Please make sure you add a value to the ${key} field`
        });
      }
    }

    // check for missing required keys
    for (let key in requiredFields) {
      if (req.body[key] == null) {
        return res.status(406).json({
          message: `You're missing the required field ${key}`
        });
      }
    }

    const { reminder_type, date_due, notify, alert_days_prior, repeat, reminder_time } = req.body;

    if (!validateReminderType(reminder_type)) {
      return res.status(406).json({
        message: "You have selected the wrong reminder type. Look below to view your options",
        options: ["email", "phone"],
      });
    }

    if (!validateDate(date_due)) {
      return res.status(406).json({
        message: "The due date you have submitted is incorrect. Please submit it in a <YYYY-MM-DD> format",
      });
    }

    if (!validateNotify(notify)) {
      return res.status(406).json({
        message: "The notify value you have inputed does not match any of the available options",
        options: notifyDict
      });
    }

    if (!validateAlertDays(alert_days_prior)) {
      return res.status(406).json({
        message: 'Please make sure the alert_days_prior field is of type Number and is >= 0'
      });
    }

    if (!validateRepeat(repeat)) {
      return res.status(406).json({
        message: "You have selected the wrong repeat type. Look below to view your options",
        options: [true, false]
      });
    }

    if (!validateTime(reminder_time)) {
      return res.status(406).json({
        message: 'Please submit a correct 24 hour time format <HH:MM>'
      });
    }

    next();
  },
  validateNotification: async (req, res, next) => {
    // check for empty field values
    for (let key in req.body) {
      if (isEmpty(req.body[key])) {
        return res.status(406).json({
          message: `Please make sure you add a value to the ${key} field`
        });
      }
    }

    // check for missing required keys
    for (let key in notifyReqFields) {
      if (req.body[key] == null) {
        return res.status(406).json({
          message: `You're missing the required field ${key}`
        });
      }
    }

    next();
  }
};
