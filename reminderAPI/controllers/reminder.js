const { isEmpty } = require("jvh-is-empty");
const { insertQuery } = require("../../services/db");
const moment = require('moment');
const { Reminders } = require('../../models/tableList');
const notifyDict = require('../services/dictionaries/notifyDict');
const cloudscheduler = require('../services/cloudScheduler');

/**
 * Create a new reminder
 * @name post/set_reminder
 * @function
 * @returns {object}
 * @private
 * @param {object} request - Express request
 * @param {object} response - Express response
 * @param {callback} next - Express next function
 * @property {string} req.user._id - User ID to connect user
 * @property {string} req.body.reminder_type - The type of reminder
 * @property {date} req.body.date_due - The due date of the reminder
 * @property {date} req.body.reminder_date - When the user want's to be reminded of said reminder
 * @property {string} req.body.repeat - When the user want's this to be re-occuring
 */
exports.setReminder = async (req, res, next) => {
  let formData = {
    user_id: req.user.uuid,
    reminder_type: req.body.reminder_type,
    date_due: req.body.date_due,
    notify: notifyDict[req.body.notify],
    repeat: req.body.repeat,
    reminder_time: req.body.reminder_time,
    reminder_message: req.body.reminder_message,
    date_created: moment(new Date()).format("YYYY-MM-DD")
  };

  try {
    await insertQuery(Reminders, [formData]);

    return res.status(201).json({
      message: 'Your reminder has been successfully created!',
      reminder: formData
    });
  } catch (err) {
    return res.status(500).json({
      message: 'There was an error while creating a new reminder', 
      serverMsg: err
    });
  }
};
