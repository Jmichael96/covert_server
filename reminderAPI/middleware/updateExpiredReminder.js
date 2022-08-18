const authorizeGCP = require('../services/authorizeGCP');
const { google } = require("googleapis");
const cloudscheduler = google.cloudscheduler("v1");
const { updateQuery } = require('../../services/db');
const { Reminders } = require('../../models/tableList');
const queryParams = {
  setConditions: [{ colName: 'terminated', colVal: true }],
  columnData: [{ colName: 'user_id', colVal: `2fo.n2aalfnrefo6rvmaim8omh3flnfVhmf`}, { colName: 'uuid', colVal: 'n0-2ffrmf.nnnf2n-2mnf6a2282om02n2of' }]
};
updateQuery('REMINDERS', queryParams);
module.exports = async (req, res, next) => {
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
        columnData: [{ colName: 'user_id', colVal: user.uuid}, { colName: 'uuid', colVal: reminderId }]
      };

      await updateQuery(Reminders, queryParams);

      next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: 'There was a problem shutting down your reminder. Please contact the owner for further details'
      });
    }
  }
};