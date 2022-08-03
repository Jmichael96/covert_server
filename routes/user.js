const router = require('express').Router();
const UserController = require('../controllers/user');
const { validateUser } = require('../middleware/creationValidator');
const clientValidator = require('../middleware/clientValidator');

/**
 * @name post/new_user
 * @function
 * @inner
 * @public
 * @param {string} path - Express path
 * @param {callback} middleware - Validate user form
 * @param {callback} middleware - Express middleware
 */
router.post('/new_user', clientValidator, validateUser, UserController.newUser);

/**
 * @name post/login
 * @function
 * @inner
 * @public
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
router.post('/login', UserController.login);

module.exports = router;