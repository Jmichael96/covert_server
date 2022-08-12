const { google } = require("googleapis");
const cloudscheduler = google.cloudscheduler("v1");
const moment = require('moment');
const CLOUD_SCHEDULER_PARENT = process.env.CLOUD_SCHEDULER_PARENT;
const PROD_URL = process.env.PROD_URL;
const cronJobBuilder = require('./cronJobBuilder');

async function authorize() {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  return await auth.getClient();
};

module.exports = async (reminderData, jobName, endpoint) => {
  const { date_due, reminder_time, alert_days_prior, notify, reminder_message } = reminderData;

  let utcMoment = moment.utc(`${date_due}T${reminder_time}`);
  let utcDate = new Date(utcMoment);
  
  const schedule = cronJobBuilder(utcDate, notify, alert_days_prior);
    
  const authClient = await authorize();
  const request = {
    parent: CLOUD_SCHEDULER_PARENT,
    resource: {
      name: `${CLOUD_SCHEDULER_PARENT}/jobs/${jobName}`,
      httpTarget: {
        uri: `${PROD_URL}${endpoint}`,
        httpMethod: "GET",
        body: ''
      },
      schedule: schedule,
      description: reminder_message
    },
    auth: authClient,
  };
  
  try {
    // const response = (await cloudscheduler.projects.locations.jobs.list(request)).data
    // const response = (
    //   await cloudscheduler.projects.locations.jobs.create(request)
    // ).data;
    // TODO: Change code below to process the `response` object:
    // console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error(err);
  }
};