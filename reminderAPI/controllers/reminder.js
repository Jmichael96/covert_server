const { isEmpty } = require("jvh-is-empty");
const { insertQuery } = require("../../services/db");
const moment = require('moment');

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
  // FIXME 
  // could possibly need to add the user email 
  let formData = {
    user_id: req.user.uuid,
    reminder_type: req.body.reminder_type,
    date_due: req.body.date_due,
    reminder_date: req.body.reminder_date,
    repeat: req.body.repeat,
    reminder_time: req.body.reminder_time,
    reminder_message: req.body.reminder_message,
    date_created: moment(new Date()).format("YYYY-MM-DD")
  };
  console.log(formData);
  try {
    return res.status(201).json({
      message: 'Your reminder has been successfully created',
      reminder: formData
    });
  } catch (err) {
    
  }
  
};
