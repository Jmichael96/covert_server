// const { google } = require("googleapis");
// const cloudscheduler = google.cloudscheduler("v1");
const moment = require('moment');
const CLOUD_SCHEDULER_PARENT = process.env.CLOUD_SCHEDULER_PARENT;
const PROD_URL = process.env.PROD_URL;
const cronJobBuilder = require('./cronJobBuilder');
const authorizeGCP = require('./authorizeGCP');
const scheduler = require('@google-cloud/scheduler');
const nodemailer = require('../../services/nodemailer');

module.exports = async (reminderData, jobName, endpoint) => {
  const { uuid, user_id, date_due, reminder_time, alert_days_prior, notify, reminder_message, repeat, reminder_type } = reminderData;

  let utcMoment = moment.utc(`${date_due}T${reminder_time}`);
  let utcDate = new Date(utcMoment);
  
  
  const schedule = cronJobBuilder(utcDate, notify, alert_days_prior);
    
  const authClient = await authorizeGCP();
  
  const cronJobName = `${CLOUD_SCHEDULER_PARENT}/jobs/${jobName}`;
  const constructedBodyObj = {
    cronJobName: cronJobName,
    reminderId: uuid,
    userId: user_id,
    reminderMessage: reminder_message,
    dateDue: date_due,
    notify: notify,
    repeat: repeat,
    alertDaysPrior: alert_days_prior,
    reminderType: reminder_type
  };
  
  // const request = {
  //   parent: CLOUD_SCHEDULER_PARENT,
  //   resource: {
  //     name: cronJobName,
  //     httpTarget: {
  //       uri: `${PROD_URL}${endpoint}`,
  //       httpMethod: "POST",
  //       body: Buffer.from(JSON.stringify(constructedBodyObj)), // must use a base64 str for this request
  //       headers: {
  //         'client-id': process.env.CLIENT_ID,
  //         'client-secret': process.env.CLIENT_SECRET,
  //         'gcp-client-id': process.env.GCP_ID,
  //         'gcp-client-secret': process.env.GCP_SECRET,
  //         'Content-Type': 'application/json'
  //       }
  //     },
  //     schedule: schedule,
  //     description: reminder_message,
  //     timeZone: 'America/Chicago'
  //   },
  //   auth: authClient
  // };

  try {
    
    const client = new scheduler.CloudSchedulerClient();
    const parent = client.locationPath(process.env.GCP_PROJECT, process.env.GCP_LOCATION);
    const job = {
      name: cronJobName,
      httpTarget: {
        uri: `${PROD_URL}${endpoint}`,
        httpMethod: "POST",
        body: Buffer.from(JSON.stringify(constructedBodyObj)), // must use a base64 str for this request
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
    };
    
    const request = {
      parent: parent,
      job: job,
      auth: authClient
    };
    // const response = (await cloudscheduler.projects.locations.jobs.list(request)).data
    // const response = (
    //   await cloudscheduler.projects.locations.jobs.create(request)
    // ).data;
    const [response] = await client.createJob(request);
    let newData = {
      jobLocation: response.name,
      jobDescription: response.description,
      state: response.state,
      schedule: '0 16 17 8 *',
      update: response.userUpdateTime
    };
    await nodemailer('jeffrey.vanhorn@yahoo.com', 'New Cron Job', `${JSON.stringify(newData)}`);
  } catch (err) {
    console.error(err);
  }
};