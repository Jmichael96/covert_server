const router = require('express').Router();
const { reminder } = require('../controllers');
const { updateExpiredReminder, initNotifyType, creationValidator, validateGCPClient, returnNotifiedUser } = require('../middleware');
const auth = require('../../middleware/auth');

/**
 * @name post/set_reminder
 * @function
 * @inner
 * @private
 * @param {string} path - Express path
 * @param {callback} middleware - Validates user authentication
 * @param {callback} middleware - Request body validation 
 * @param {callback} middleware - Express middleware
 */
router.post('/set_reminder', auth, creationValidator.validateReminder, reminder.setReminder);

/**
 * @name post/notify
 * @function
 * @inner
 * @private
 * @param {string} path - Express path
 * @param {callback} middleware - Validates GCP client headers
 * @param {callback} middleware - Validates that the correct req body is passed in
 * @param {callback} middleware - Passes in the user data to the next middleware 
 * @param {callback} middleware - Notifies the user according to the type of notification reminder
 * @param {callback} middleware - Double checks to see if the reminder is re-occuring
 * @param {callback} middleware - Express middleware
 */
router.post('/notify', 
  validateGCPClient, 
  creationValidator.validateNotification,
  returnNotifiedUser, 
  initNotifyType,
  updateExpiredReminder,
  reminder.notifyUser
);

/**
 * @name post/fetch_reminders
 * @function
 * @inner
 * @private
 * @param {string} path - Express path
 * @param {callback} middleware - Validates user authentication
 * @param {callback} middleware - Express middleware
 */
router.get('/fetch_reminders', auth, reminder.fetchReminders);

module.exports = router;