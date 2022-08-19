const authorizeGCP = require('../services/authorizeGCP');
const { google } = require("googleapis");
const cloudscheduler = google.cloudscheduler("v1");
const { updateQuery } = require('../../services/db');
const { Reminders } = require('../../models/tableList');
const nodemailer = require('../../services/nodemailer');
//{ colName: 'user_id', colVal: `2fo.n2aalfnrefo6rvmaim8omh3flnfVhmf`}, 
// const queryParams = {
//   setConditions: [{ colName: 'terminated', colVal: true }],
//   columnData: [
//   { colName: 'uuid', colVal: '_0of4hf38h08m3l3j_efH2jjf2e2ef0fefj' }]
// };
// updateQuery('REMINDERS', queryParams, (err, data) => {
  // if (err) {
  //   return;
  // }
  // console.log(data);
// });
module.exports = async (req, res, next) => {
  console.log('REQ.BODY =======>>>>>>>> ', req.body);
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
        setConditions: [{ colName: 'terminated', colVal: true }],
        columnData: [{ colName: 'uuid', colVal: reminderId }]
      };
      // await nodemailer('jeffrey.vanhorn@yahoo.com', 'Query Params', `${JSON.stringify(queryParams)}`);
      await updateQuery(Reminders, queryParams, (err, data) => {
        if (err) {
          return;
        }
        console.log(data);
      });

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