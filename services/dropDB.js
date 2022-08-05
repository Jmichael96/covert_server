require("dotenv").config({ path: '../.env' });
const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery();
const tables = require('../models/tableList');

const dropTables = async () => {
  const datasetId = process.env.GCP_DATASET;
  for (let key in tables) {
    await bigquery.dataset(datasetId).table(tables[key]).delete();
    console.log(`${tables[key]} successfully removed`);
  }
};

(async function () {
  dropTables();
}());