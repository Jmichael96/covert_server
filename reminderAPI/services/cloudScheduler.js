const { google } = require("googleapis");
const cloudscheduler = google.cloudscheduler("v1");

async function main() {
  const authClient = await authorize();
  const request = {
    // Required. The location name. For example:
    // `projects/PROJECT_ID/locations/LOCATION_ID`.
    parent: "projects/covertservertest/locations/us-central1",

    resource: {
      name: `projects/covertservertest/locations/us-central1/jobs/the-ultimate-remote-schedule`,
      httpTarget: {
        uri: "http://codevh.com",
        httpMethod: "GET",
      },
      schedule: "0 1 * * 0",
    },

    auth: authClient,
  };

  try {
    // const response = (await cloudscheduler.projects.locations.jobs.list(request)).data
    const response = (
      await cloudscheduler.projects.locations.jobs.create(request)
    ).data;
    // TODO: Change code below to process the `response` object:
    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error(err);
  }
}

// main();

async function authorize() {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  return await auth.getClient();
};
