const { isEmpty } = require("jvh-is-empty");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Cryptr = require("cryptr");
const DB_Handler = require("../services/db");
const { Users } = require("../models/tableList");
const cryptr = new Cryptr(process.env.CRYPTR_SECRET);
const moment = require("moment");
const { generateCustomUuid } = require('custom-uuid');

// /**
//  * Creates a new user
//  * @name post/new_user
//  * @function
//  * @returns {object}
//  * @public
//  * @param {object} request - Express request
//  * @param {object} response - Express response
//  * @param {callback} next - Express next function
//  * @property {string} req.body.name - Full name of the user
//  * @property {string} req.body.email - Email of user
//  * @property {string} req.body.password - User password
//  * @property {string} req.body.phone - Phone number of user
//  */
exports.newUser = async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const fetchingColData = [{ colName: "email", colVal: email }];
  const tableName = Users;
  const db = new DB_Handler();
  // check to see if there is an existing user with the same email and phone #
  let foundUser = await db.fetchQuery(tableName, fetchingColData);

  if (!isEmpty(foundUser)) {
    return res.status(401).json({
      message: "A user with that email already exists",
    });
  }

  await bcrypt
  .hash(password, 8)
  .then(async (hash) => {

      let newUser = {
        uuid: generateCustomUuid(`${name.replace(' ', '_')}.${email}.${phone}`, 35),
        name: name,
        email: email,
        password: hash,
        phone: cryptr.encrypt(phone),
        date_created: moment(new Date()).format("YYYY-MM-DD"),
      };

      await db.insertRow(tableName, newUser);

      const payload = {
        user: {
          uuid: newUser.uuid,
          name: newUser.name,
          email: newUser.email,
          phone: cryptr.decrypt(newUser.phone),
          date_created: newUser.date_created,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 3600 },
        (err, token) => {
          if (err) {
            return res.status(500).json({
              message: 'There was a problem when signing the payload',
              serverMsg: err.message,
            });
          }
          return res.status(201).json({
            message: 'User successfully created'
          });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      if (err.message) {
        return res.status(500).json({
          message: err.message,
        });
      }
      const bigqueryError = err.errors[0].errors;
      if (bigqueryError) {
        return res.status(500).json({
          message: bigqueryError,
          type: "BigQuery Error",
        });
      }
      
    });
};

/**
 * Login
 * @name post/login
 * @function
 * @returns {object}
 * @public
 * @param {object} request - Express request
 * @param {object} response - Express response
 * @param {callback} next - Express next function
 * @property {string} req.body.email - Email of user
 * @property {string} req.body.password - User password
 */
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (isEmpty(email) || isEmpty(password)) {
    return res.status(401).json({
      message:
        "Your credentials are invalid. Please try again or don't come back",
    });
  }
  const tableName = Users;
  const fetchingColData = [{ colName: "email", colVal: email }];
  const db = new DB_Handler();
  let foundUser = await db.fetchQuery(tableName, fetchingColData);

  if (isEmpty(foundUser)) {
    return res.status(404).json({
      message: "A user with that email does not exist here at Covert_Server",
    });
  }
  let parsedUser = foundUser[0];

  let passwordValidated = await bcrypt.compare(password, parsedUser.password);

  if (!passwordValidated) {
    return res.status(401).json({
      message:
        "Your credentials are invalid. Please try again or don't come back",
    });
  }

  const payload = {
    user: {
      uuid: parsedUser.uuid,
      name: parsedUser.name,
      phone: cryptr.decrypt(parsedUser.phone),
      date_created: parsedUser.date_created['value']
    }
  };

  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
    if (err) {
      return res.status(500).json({
        message: 'There was a problem signing the payload',
        serverMsg: err.message
      });
    }
    return res.status(201).json({
      message: `Welcome, ${payload.user.name}!`,
      personal_info: payload.user,
      token: token,
      header_parameters: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      }
    });
  });
};
