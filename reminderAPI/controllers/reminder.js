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
    uuid: generateCustomUuid(`${req.user.uuid}${req.body.date_due}`, 35),
    user_id: req.user.uuid,
    reminder_type: req.body.reminder_type,
    date_due: req.body.date_due,
    alert_days_prior: req.body.alert_days_prior,
    notify: notifyDict[req.body.notify],
    repeat: req.body.repeat,
    reminder_time: req.body.reminder_time += ':00',
    reminder_message: req.body.reminder_message,
    date_created: moment(new Date()).format("YYYY-MM-DD"),
    terminated: false
  };

  try {

    const jobName = `${req.user.name.replace(' ', '_')}${generateCustomUuid(`${formData.user_id}${req.user.phone}`, 20)}_${formData.notify.split(' ').join('_')}`
    const apiEndpoint = '/api/covert_server/reminders/notify';
    let replacementChars = { '@': 0, '.': 2 };
    // replace the jobName characters that match the above object keys
    await cloudScheduler(formData, jobName.replace(/[@.]/g, (m) => replacementChars[m]), apiEndpoint);
    await insertQuery(Reminders, [formData]);

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
 * @property {string} req.body.cronJobName 
 * @property {string} req.body.reminderId
 * @property {string} req.body.userId 
 * @property {boolean} req.body.repeat 
 * @property {string} req.body.reminderMessage 
 * @property {date} req.body.dateDue 
 * @property {string} req.body.notify 
 * @property {integer} req.body.alertDaysPrior 
 * @property {string} req.body.reminderType 
 * @property {object} res.user - User body is passed in
 */
exports.notifyUser = async (req, res, next) => {
  res.status(200).json({
    message: 'User notified successfully'
  });
};