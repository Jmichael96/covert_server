const router = require('express').Router();
const { reminder } = require('../controllers');
const { validateReminder } = require('../middleware/creationValidator');

/**
 * @name post/set_reminder
 * @function
 * @inner
 * @public
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
router.post('/set_reminder', validateReminder, reminder.setReminder);

module.exports = router;