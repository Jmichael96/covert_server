const router = require('express').Router();
const { reminder } = require('../controllers');
const { updateExpiredReminder, initNotifyType, creationValidator, validateGCPClient, returnNotifiedUser } = require('../middleware');
const auth = require('../../middleware/auth');

/**
 * @typedef {String<YYYY-MM-DD>} Date
 * @param {Date} Container
 */
/**
 * @typedef {String} Reminder
 * @property {String} phone Reminds the user by phone
 * @property {String} email Reminds the user by email
 * @param {Reminder} Container
 */
/**
 * @typedef {String} Time 
 * @property {String} 00:00 24 hour time format
 * @param {Time} Container
 */
/**
  * @typedef {Object.<number>} Notify
  * @property {number} 1 daily
  * @property {number} 2 weekly
  * @property {number} 3 bi-weekly
  * @property {number} 4 monthly
  * @property {number} 5 yearly
  * @property {number} 6 1st of every month
  * @property {number} 7 15th of every month
  * @property {number} 100 on due date
 * @param {Notify} Container
 */
/**
 * Creates a new reminder for you
 * 
 * @name Set Reminder
 * @route {POST} /api/covert_server/reminders/set_reminder
 * @headerparam {String} Authorization The bearer token you're given after you login to Covert Server
 * @headerparam {String} client-id The unique client-id given to you by the owner
 * @headerparam {String} client-secret The unique client-secret given to you by the owner
 * @headerparam {String} Content-Type application/json
 * @bodyparam {Reminder} reminder_type The way you would like to be notified. Either by phone or by email
 * @bodyparam {Date} date_due The due date of which you're being reminded for
 * @bodyparam {Notify} notify Selects the pattern you want to be notified by
 * @bodyparam {Number} alert_days_prior Alerts you x amount of days prior to your selected time due date.
 * @bodyparam {Boolean} repeat Dictates whether this is a one time reminder or continues
 * @bodyparam {Time} reminder_time What time you want to be alerted
 * @bodyparam {String} reminder_message The message that displays when being notified
 */
router.post('/set_reminder', auth, creationValidator.validateReminder, reminder.setReminder);

// /**
//  * @name post/notify
//  * @function
//  * @inner
//  * @private
//  * @param {string} path - Express path
//  * @param {callback} middleware - Validates GCP client headers
//  * @param {callback} middleware - Validates that the correct req body is passed in
//  * @param {callback} middleware - Passes in the user data to the next middleware 
//  * @param {callback} middleware - Notifies the user according to the type of notification reminder
//  * @param {callback} middleware - Double checks to see if the reminder is re-occuring
//  * @param {callback} middleware - Express middleware
//  */
router.post('/notify', 
  validateGCPClient, 
  creationValidator.validateNotification,
  returnNotifiedUser, 
  initNotifyType,
  updateExpiredReminder,
  reminder.notifyUser
);


/**
 * Fetches all your existing reminders
 * 
 * @name Fetch reminders
 * @route {GET} /api/covert_server/reminders/fetch_reminders
 * @headerparam {String} Authorization The bearer token you're given after you login to Covert Server
 * @headerparam {String} client-id The unique client-id given to you by the owner
 * @headerparam {String} client-secret The unique client-secret given to you by the owner
 * @headerparam {String} Content-Type application/json
 */
router.get('/fetch_reminders', auth, reminder.fetchReminders);

/**
 * Deletes a reminder
 * 
 * @name Delete reminder
 * @route {DELETE} /api/covert_server/reminders/delete_reminder
 * @headerparam {String} Authorization The bearer token you're given after you login to Covert Server
 * @headerparam {String} client-id The unique client-id given to you by the owner
 * @headerparam {String} client-secret The unique client-secret given to you by the owner
 * @headerparam {String} Content-Type application/json
 * @routeparam {String} reminder_uuid The reminder uuid
 * @routeparam {String} job_name The location job name from GCP
 */
router.delete('/delete_reminder', auth, reminder.deleteReminder);

/**
 * Fetches user's reminder
 * 
 * @name Fetch reminder
 * @route {GET} /api/covert_server/reminders/fetch_reminder
 * @headerparam {String} Authorization The bearer token you're given after you login to Covert Server
 * @headerparam {String} client-id The unique client-id given to you by the owner
 * @headerparam {String} client-secret The unique client-secret given to you by the owner
 * @headerparam {String} Content-Type application/json
 */
router.get('/fetch_reminder/:reminderId', auth, reminder.fetchReminder);

/**
 * Update user's reminder
 * 
 * @name Update reminder
 * @route {PUT} /api/covert_server/reminders/update_reminder
 * @headerparam {String} Authorization The bearer token you're given after you login to Covert Server
 * @headerparam {String} client-id The unique client-id given to you by the owner
 * @headerparam {String} client-secret The unique client-secret given to you by the owner
 * @headerparam {String} Content-Type application/json
 */
router.put('/update_reminder', auth, reminder.updateReminder);

module.exports = router;