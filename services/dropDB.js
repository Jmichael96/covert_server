require("dotenv").config({ path: '../.env' });
const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery();
const tables = require('../models/tableList');

const dropTables = async () => {
  const datasetId =
    process.argv[2] === "prod"
      ? process.env.PROD_DATASET
      : process.env.DEV_DATASET;
  try {
    for (let key in tables) {
      await bigquery.dataset(datasetId).table(tables[key]).delete();
      console.log(`${tables[key]} successfully removed`);
    }
  } catch (err) {
    console.error(JSON.parse(err.response.body));
  }
};

(async function () {
  dropTables();
}());