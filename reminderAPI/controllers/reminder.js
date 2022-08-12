const { isEmpty } = require("jvh-is-empty");
const { insertQuery } = require("../../services/db");
const moment = require('moment');
const { Reminders } = require('../../models/tableList');
const notifyDict = require('../services/dictionaries/notifyDict');
const cloudScheduler = require('../services/cloudScheduler');

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

    const jobName = `${req.user.phone}_${formData.notify.split(' ').join('_')}_${formData.date_due}`
    const apiEndpoint = '/api/notify';

    // await insertQuery(Reminders, [formData]);
    await cloudScheduler(formData, jobName, apiEndpoint);

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

var localDate = new Date();
var localMoment = moment();
var utcMoment = moment.utc();
var utcDate = new Date( utcMoment.format() );

//These are all the same
// console.log( 'localData unix = ' + localDate.valueOf() );
// console.log( 'localMoment unix = ' + localMoment.valueOf() );
// console.log( 'utcMoment unix = ' + utcMoment.valueOf() );

// //These formats are different
// console.log( 'localDate = ' + localDate );
// console.log( 'localMoment string = ' + localMoment.format() );
// console.log( 'utcMoment string = ' + utcMoment.format() );
// console.log( 'utcDate  = ' + utcDate ); 

// //One to show conversion
// console.log( 'localDate as UTC format = ' + moment.utc( localDate ).format() );
// console.log( 'localDate as UTC unix = ' + moment.utc( localDate ).valueOf() );

