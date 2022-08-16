const { isEmpty } = require("jvh-is-empty");
const { insertQuery } = require("../../services/db");
const moment = require('moment');
const { Reminders } = require('../../models/tableList');
const notifyDict = require('../services/dictionaries/notifyDict');
const cloudScheduler = require('../services/cloudScheduler');
const { generateCustomUuid } = require('custom-uuid');

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
    alert_days_prior: req.body.alert_days_prior,
    notify: notifyDict[req.body.notify],
    repeat: req.body.repeat,
    reminder_time: req.body.reminder_time += ':00',
    reminder_message: req.body.reminder_message,
    date_created: moment(new Date()).format("YYYY-MM-DD")
  };

  try {

    const jobName = `${req.user.name.replace(' ', '_')}${generateCustomUuid(`${formData.user_id}${req.user.phone}`, 20)}_${formData.notify.split(' ').join('_')}`
    const apiEndpoint = '/api/api/covert_server/reminders/notify';
 
    await cloudScheduler(formData, jobName, apiEndpoint);
    // await insertQuery(Reminders, [formData]);

    return res.status(201).json({
      message: 'Your reminder has been successfully created! You will recieve a message shortly stating your schedule is up and running',
      reminder: formData
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'There was an error while creating a new reminder', 
      serverMsg: err
    });
  }
};

/**
 * Initiate reminder protocol
 * @name post/notify
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
exports.notifyUser = async (req, res, next) => {

};