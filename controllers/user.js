const { isEmpty } = require("jvh-is-empty");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Cryptr = require("cryptr");
const { fetchQuery, insertQuery } = require("../services/db");
const { Users } = require("../models/tableList");
const cryptr = new Cryptr(process.env.CRYPTR_SECRET);
const moment = require('moment');

/**
 * Creates a new user
 * @name post/new_user
 * @function
 * @returns {object}
 * @public
 * @param {object} request - Express request
 * @param {object} response - Express response
 * @param {callback} next - Express next function
 * @property {string} req.body.name - Full name of the user
 * @property {string} req.body.email - Email of user
 * @property {string} req.body.password - User password
 * @property {string} req.body.phone - Phone number of user
 */
exports.newUser = async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const fetchingColData = [{ colName: 'email', colVal: email }];
  const tableName = Users;

  // check to see if there is an existing user with the same email and phone #
  let foundUser = await fetchQuery(tableName, fetchingColData);

  if (!isEmpty(foundUser)) {
    return res.status(401).json({
      message: 'A user with that email already exists'
    });
  }

  await bcrypt.hash(password, 8).then(async (hash) => {
    let newUser = {
      name: name, 
      email: email,
      password: hash,
      phone: cryptr.encrypt(phone),
      date_created: moment(new Date()).format('YYYY-MM-DD')
    };

    await insertQuery(tableName, [newUser]);
    
    const payload = {
      name: newUser.name,
      email: newUser.email,
      phone: cryptr.decrypt(newUser.phone),
      date_created: newUser.date_created
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) {
        return res.status(500).json({
          message: 'There was a problem when signing the payload',
          serverMsg: err.message
        });
      }
      return res.status(201).json({
        message: 'User successfully created',
        token: token
      });
    });
  }).catch((err) => {
    const bigqueryError = err.errors[0].errors;
    if (bigqueryError) {
      return res.status(500).json({
        message: bigqueryError,
        type: 'BigQuery Error'
      });
    }
    return res.status(500).json({
      message: err.message
    });
  });
};
