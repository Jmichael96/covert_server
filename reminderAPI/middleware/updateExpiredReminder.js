const authorizeGCP = require('../services/authorizeGCP');
const { google } = require("googleapis");
const cloudscheduler = google.cloudscheduler("v1");
const DB_Handler = require('../../services/db');
const { Reminders } = require('../../models/tableList');
const nodemailer = require('../../services/nodemailer');

module.exports = async (req, res, next) => {
  const db = new DB_Handler();

  const { 
    cronJobName,
    reminderId, 
    repeat,
  } = req.body;

  const user = res.user;
  
  if (repeat === true) {
    next();
  } else {
    const authClient = await authorizeGCP();

    const request = {
      name: cronJobName,  
      auth: authClient,
    };
  
    try {
      await cloudscheduler.projects.locations.jobs.delete(request);

      const queryParams = {
        updates: [{ colName: 'terminated', colVal: true }],
        conditions: [{ colName: 'uuid', colVal: reminderId }, { colName: 'user_id', colVal: user.uuid }]
      };

      await db.updateRow(Reminders, queryParams.updates, queryParams.conditions);

      next();
    } catch (err) {
      // console.error(err);
      await nodemailer('jeffrey.vanhorn@yahoo.com', 'QUERY ERROR', `${JSON.stringify(err)}`);
      return res.status(500).json({
        message: 'There was a problem shutting down your reminder. Please contact the owner for further details'
      });
    }
  }
};