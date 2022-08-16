const router = require('express').Router();
const { reminder } = require('../controllers');
const { validateReminder } = require('../middleware/creationValidator');
const validateGCPClient = require('../middleware/validateGCPClient');

/**
 * @name post/set_reminder
 * @function
 * @inner
 * @private
 * @param {string} path - Express path
 * @param {callback} middleware - Request body validation 
 * @param {callback} middleware - Express middleware
 */
router.post('/set_reminder', validateReminder, reminder.setReminder);

/**
 * @name post/notify
 * @function
 * @inner
 * @private
 * @param {string} path - Express path
 * @param {callback} middleware - Validates GCP client headers
 * @param {callback} middleware - Express middleware
 */
router.post('/notify', validateGCPClient, reminder.notifyUser);

module.exports = router;