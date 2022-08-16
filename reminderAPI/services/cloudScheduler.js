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
  const { user_id, date_due, reminder_time, alert_days_prior, notify, reminder_message, repeat } = reminderData;

  let utcMoment = moment.utc(`${date_due}T${reminder_time}`);
  let utcDate = new Date(utcMoment);
  
  const schedule = cronJobBuilder(utcDate, notify, alert_days_prior);
    
  const authClient = await authorize();

  const constructedBodyObj = {
    userId: user_id,
    reminderMessage: reminder_message,
    dateDue: date_due,
    notify: notify,
    repeat: repeat,
    alertDaysPrior: alert_days_prior
  };
  
  const request = {
    parent: CLOUD_SCHEDULER_PARENT,
    resource: {
      name: `${CLOUD_SCHEDULER_PARENT}/jobs/${jobName}`,
      httpTarget: {
        uri: `${PROD_URL}${endpoint}`,
        httpMethod: "POST",
        body: Buffer.from(JSON.stringify(constructedBodyObj)).toString('base64'), // must use a base64 str for this request
        headers: {
          'client-id': process.env.CLIENT_ID,
          'client-secret': process.env.CLIENT_SECRET,
          'gcp-client-id': process.env.GCP_ID,
          'gcp-client-secret': process.env.GCP_SECRET,
          'Content-Type': 'application/json'
        }
      },
      schedule: schedule,
      description: reminder_message,
      timeZone: 'America/Chicago'
    },
    auth: authClient
  };

  try {
    // const response = (await cloudscheduler.projects.locations.jobs.list(request)).data
    const response = (
      await cloudscheduler.projects.locations.jobs.create(request)
    ).data;
    // TODO: Change code below to process the `response` object:
    console.log(JSON.stringify(response, null, 2));
    console.log(response);
  } catch (err) {
    console.error(err);
  }
};