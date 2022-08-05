const { isEmpty } = require("jvh-is-empty");
const reminderTypeDict = require("../services/dictionaries/reminderTypeDict");
const moment = require("moment");
const repeatDict = require('../services/dictionaries/repeatDict');
const requiredFields = require('../services/dictionaries/requiredReminderFields');

const validateReminderType = (type) => {
  if (!reminderTypeDict[type]) return false;
  return true;
};

const validateDate = (date) => {
  if (!moment(date, "YYYY-MM-DD", true).isValid()) return false;
  return true;
};

const validateRepeat = (repeatType) => {
  if (!repeatDict[repeatType]) return false;
  return true;
};

const validateTime = (time) => moment(time, 'H:mm:s', true).isValid();

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
      if (!req.body[key]) {
        return res.status(406).json({
          message: `You're missing the required field ${key}`
        });
      }
    }

    const { reminder_type, date_due, reminder_date, repeat, reminder_time, reminder_message } = req.body;

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

    if (!validateDate(reminder_date)) {
      return res.status(406).json({
        message: "The reminder date you have submitted is incorrect. Please submit it in a <YYYY-MM-DD> format",
      });
    }

    if (!validateRepeat(repeat)) {
      return res.status(406).json({
        message: "You have selected the wrong repeat type. Look below to view your options",
        options: Object.keys(repeatDict)
      });
    }

    if (!validateTime(reminder_time)) {
      return res.status(406).json({
        message: 'Please submit a correct 24 hour time format <HH:MM:SS>'
      });
    }
    
    next();
  }
};
