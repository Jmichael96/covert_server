const authorizeGCP = require('../services/authorizeGCP');
const { google } = require("googleapis");
const cloudscheduler = google.cloudscheduler("v1");
const { updateQuery, fetchQuery } = require('../../services/db');
const { Reminders } = require('../../models/tableList');
const nodemailer = require('../../services/nodemailer');
//{ colName: 'user_id', colVal: `2fo.n2aalfnrefo6rvmaim8omh3flnfVhmf`}, 
const queryParams = {
  setConditions: [{ colName: 'terminated', colVal: true }],
  columnData: [
  { colName: 'uuid', colVal: '_0of4hf38h08m3l3j_efH2jjf2e2ef0fefj' }]
};

const callStuff = async () => {
  // const fetchingColData = [{ colName: "uuid", colVal: "m3mm2j330oem2j43ef9Hm4f2mh_fe_2oo34" }, { colName: "user_id", colVal: 'v.rj3o83jmr_4fyhf_e.3elfHreejm3.mf9'}];
  // const res = await fetchQuery('REMINDERS', fetchingColData);
  // console.log(res);  
  // let data = {
  //   uuid: 'm3mm2j330oem2j43ef9Hm4f2mh_fe_2oo34',
  //   user_id: 'v.rj3o83jmr_4fyhf_e.3elfHreejm3.mf9',
  //   reminder_type: 'phone',
  //   date_due: '2022-08-19',
  //   notify: 'on due date',
  //   alert_days_prior: 0,
  //   repeat: false,
  //   reminder_time:'15:20:00' ,
  //   date_created: '2022-08-19',
  //   reminder_message: 'Hopefully it\'s fixed?...',
  //   terminated: true
  // };
  await updateQuery('REMINDERS', queryParams, (err, data) => {
    if (err) {

      return;
    }
    console.log(data);
  });
}
// callStuff();

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