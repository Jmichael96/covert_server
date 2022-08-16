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

module.exports = router;