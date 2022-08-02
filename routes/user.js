const router = require('express').Router();
const UserController = require('../controllers/user');
const { validateUser } = require('../middleware/creationValidator');

/**
 * @name post/new_user
 * @function
 * @inner
 * @public
 * @param {string} path - Express path
 * @param {callback} middleware - Validate user form
 * @param {callback} middleware - Express middleware
 */
router.post('/new_user', validateUser, UserController.newUser);

module.exports = router;