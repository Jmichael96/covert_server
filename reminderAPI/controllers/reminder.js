const { isEmpty } = require("jvh-is-empty");
const DB_Handler = require("../../services/db");
const moment = require("moment");
const { Reminders } = require("../../models/tableList");
const notifyDict = require("../services/dictionaries/notifyDict");
const cloudScheduler = require("../services/cloudScheduler");
const { generateCustomUuid } = require("custom-uuid");
const authorizeGCP = require("../services/authorizeGCP");
const { google } = require("googleapis");
const cloudscheduler = google.cloudscheduler("v1");
const CLOUD_SCHEDULER_PARENT = process.env.CLOUD_SCHEDULER_PARENT;
const PROD_URL = process.env.PROD_URL;
const cronJobBuilder = require("../services/cronJobBuilder");

/**
 * Create a new reminder
 * @name post/set_reminder
 * @function
 * @returns {object}
 * @private
 * @param {object} request - Express request
 * @param {object} response - Express response
 * @param {callback} next - Express next function
 * @property {string} req.user._id - User ID to connect user
 * @property {string} req.body.reminder_type - The type of reminder
 * @property {date} req.body.date_due - The due date of the reminder
 * @property {date} req.body.reminder_date - When the user want's to be reminded of said reminder
 * @property {string} req.body.repeat - When the user want's this to be re-occuring
 */
exports.setReminder = async (req, res, next) => {
  let replacementChars = { "@": 0, ".": 2, "-": 4 };
  let uuidCombo = `${req.user.uuid}${req.body.date_due}`.replace(
    /[@.-]/g,
    (m) => replacementChars[m]
  );
  let formData = {
    uuid: generateCustomUuid(uuidCombo, 35),
    user_id: req.user.uuid,
    reminder_type: req.body.reminder_type,
    date_due: req.body.date_due,
    alert_days_prior: req.body.alert_days_prior,
    notify: notifyDict[req.body.notify],
    repeat: req.body.repeat,
    reminder_time: (req.body.reminder_time += ":00"),
    reminder_message: req.body.reminder_message,
    date_created: moment(new Date()).format("YYYY-MM-DD"),
    terminated: false,
    price: req.body.price ? Number(req.body.price) : 0,
    deposit: req.body.deposit ? true : false,
  };

  try {
    if (process.env.NODE_ENV === "production") {
      const jobName = `${req.user.name.replace(" ", "_")}${generateCustomUuid(
        `${formData.user_id}${req.user.phone}`,
        20
      )}_${formData.notify.split(" ").join("_")}`;
      const apiEndpoint = "/api/covert_server/reminders/notify";

      // replace the jobName characters that match the above object keys
      const cronJobName = await cloudScheduler(
        formData,
        jobName.replace(/[@.-]/g, (m) => replacementChars[m]),
        apiEndpoint
      );
      formData["job_name"] = cronJobName;
    } else {
      formData["job_name"] = "test_job_name";
    }
    const db = new DB_Handler();
    await db.insertRow(Reminders, formData);

    return res.status(201).json({
      message:
        "Your reminder has been successfully created! You will recieve a message shortly stating your schedule is up and running",
      reminder: formData,
    });
  } catch (err) {
    console.log(
      "ERROR: An error occurred in the setReminder express method ===========>>>>>>>>>>>>."
    );
    return res.status(500).json({
      message: "There was an error while creating a new reminder",
      serverMsg: err,
    });
  }
};

/**
 * Initiate reminder protocol
 * @name post/notify
 * @function
 * @returns {object}
 * @private
 * @param {object} request - Express request
 * @param {object} response - Express response
 * @param {callback} next - Express next function
 * @property {string} req.body.cronJobName
 * @property {string} req.body.reminderId
 * @property {string} req.body.userId
 * @property {boolean} req.body.repeat
 * @property {string} req.body.reminderMessage
 * @property {date} req.body.dateDue
 * @property {string} req.body.notify
 * @property {integer} req.body.alertDaysPrior
 * @property {string} req.body.reminderType
 * @property {object} res.user - User body is passed in
 */
exports.notifyUser = async (req, res, next) => {
  res.status(200).json({
    message: "User notified successfully",
  });
};

/**
 * Fetch user's reminders
 * @name post/fetch_reminders
 * @function
 * @returns {object}
 * @private
 * @param {object} request - Express request
 * @param {object} response - Express response
 * @param {callback} next - Express next function
 */
exports.fetchReminders = async (req, res, next) => {
  try {
    const db = new DB_Handler();
    const fetchColData = [{ colName: "user_id", colVal: req.user.uuid }];

    let dbRes = await db.fetchQuery(Reminders, fetchColData);

    if (isEmpty(dbRes)) {
      return res.status(404).json({
        message: "Could not find the reminders associatated with your account",
      });
    }

    return res.status(200).json({
      message: "Fetched reminders successfully",
      reminders: dbRes,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
};

/**
 * Delete a user's reminder
 * @name post/delete_reminder
 * @function
 * @returns {object}
 * @private
 * @param {object} request - Express request
 * @param {object} response - Express response
 * @param {callback} next - Express next function
 * @property {string} req.body.reminder_uuid
 * @property {string} req.body.job_name
 */
exports.deleteReminder = async (req, res, next) => {
  const { reminder_uuid, job_name } = req.query;

  if (isEmpty(reminder_uuid) || isEmpty(job_name)) {
    return res.status(406).json({
      message: "You must pass a valid reminder_uuid and job_name parameter",
    });
  }
  try {
    const authClient = await authorizeGCP();

    const request = {
      name: job_name,
      auth: authClient,
    };

    if (process.env.NODE_ENV === "production") {
      await cloudscheduler.projects.locations.jobs.delete(request);
    }

    const queryParams = {
      updates: [{ colName: "terminated", colVal: true }],
      conditions: [
        { colName: "uuid", colVal: reminder_uuid },
        { colName: "user_id", colVal: req.user.uuid },
      ],
    };
    const db = new DB_Handler();
    await db.updateRow(Reminders, queryParams.updates, queryParams.conditions);

    return res.status(200).json({
      message: "Deleted reminder data successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred",
    });
  }
};

/**
 * Fetch user's reminder
 * @name get/fetch_reminder/:reminderId
 * @function
 * @returns {object}
 * @private
 * @param {object} request - Express request
 * @param {object} response - Express response
 * @param {callback} next - Express next function
 */
exports.fetchReminder = async (req, res, next) => {
  if (isEmpty(req.params.reminderId)) {
    return res.status(406).json({
      message: "Please make sure a reminder ID is passed in",
    });
  }
  try {
    const db = new DB_Handler();
    const fetchColData = [
      { colName: "user_id", colVal: req.user.uuid },
      { colName: "uuid", colVal: req.params.reminderId },
    ];
    let dbRes = await db.fetchQuery(Reminders, fetchColData);

    if (isEmpty(dbRes)) {
      return res.status(404).json({
        message: "Could not find the reminder associatated with your account",
      });
    }
    return res.status(200).json({
      message: "Fetched reminder successfully",
      reminder: dbRes[0],
    });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred",
    });
  }
};

/**
 * Update user's reminder
 * @name get/update_reminder
 * @function
 * @returns {object}
 * @private
 * @param {object} request - Express request
 * @param {object} response - Express response
 * @param {callback} next - Express next function
 */
exports.updateReminder = async (req, res, next) => {
  if (isEmpty(req.query.reminderId)) {
    return res.status(406).json({
      message: "Please make sure a reminder ID is passed in",
    });
  }
  try {
    const db = new DB_Handler();
    const fetchColData = [
      { colName: "uuid", colVal: req.query.reminderId },
      { colName: "user_id", colVal: req.user.uuid },
    ];
    const foundReminder = await db.fetchQuery(Reminders, fetchColData);

    let formData = {
      uuid: req.query.reminderId,
      user_id: req.user.uuid,
      reminder_type: req.body.reminder_type,
      date_due: req.body.date_due,
      alert_days_prior: req.body.alert_days_prior,
      notify: notifyDict[req.body.notify],
      repeat: req.body.repeat,
      reminder_time: req.body.reminder_time,
      reminder_message: req.body.reminder_message,
      terminated: false,
      price: req.body.price ? Number(req.body.price) : 0,
      deposit: req.body.deposit ? true : false,
    };

    if (isEmpty(foundReminder)) {
      return res.status(404).json({
        message:
          "Could not find the reminder you wanted to update. Please try again later",
      });
    }

    if (process.env.NODE_ENV === "production") {
      const authClient = await authorizeGCP();
      let utcMoment = moment.utc(
        `${req.body.date_due}T${req.body.reminder_time}`
      );

      let utcDate = new Date(utcMoment);
      console.log(utcDate, formData.notify);
      const schedule = cronJobBuilder(
        utcDate,
        formData.notify,
        req.body.alert_days_prior
      );
      console.log(schedule);

      // const job = {
      //   name: cronJobName,
      //   httpTarget: {
      //     uri: `${PROD_URL}${endpoint}`,
      //     httpMethod: "POST",
      //     body: Buffer.from(JSON.stringify(constructedBodyObj)), // must use a base64 str for this request
      //     headers: {
      //       "client-id": process.env.CLIENT_ID,
      //       "client-secret": process.env.CLIENT_SECRET,
      //       "gcp-client-id": process.env.GCP_ID,
      //       "gcp-client-secret": process.env.GCP_SECRET,
      //       "Content-Type": "application/json",
      //     },
      //   },
      //   schedule: schedule,
      //   description: reminder_message,
      //   timeZone: "America/Chicago",
      // };

      const patchData = {
        name: req.body.job_name,
        httpTarget: {
          body: Buffer.from(JSON.stringify(formData)),
        },
        description: req.body.reminder_message,
        timeZone: "America/Chicago",
      };

      console.log(patchData);

      // await cloudscheduler.projects.locations.jobs.patch();
    }

    let updateColData = {
      updates: [],
      conditions: [
        { colName: "uuid", colVal: req.query.reminderId },
        { colName: "user_id", colVal: req.user.uuid },
      ],
    };

    for (let val in formData) {
      updateColData.updates.push({
        colName: val,
        colVal: typeof(formData[val]) === "string" ? formData[val].replace(/'/g, "\\'") : formData[val],
      });
    }

    await db.updateRow(
      Reminders,
      updateColData.updates,
      updateColData.conditions
    );
    console.log("updated row successfullly");
    return res.status(200).json({
      message: "Your reminder has been successfully updated",
      updatedReminder: req.body,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
};
