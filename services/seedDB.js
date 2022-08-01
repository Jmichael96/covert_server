require("dotenv").config({ path: '../.env' });
const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery();
const tables = require('../models/tables.schema');

const createTable = async (tableName, schema) => {
  const datasetId = process.env.GCP_DATASET;
  const options = {
    schema: schema,
    location: 'US'
  };
  const [table] = await bigquery.dataset(datasetId).createTable(tableName, options);
  return table;
};

(async function() {
  let tablesCreated = [];

  // create tables
  for (let tableData of tables) {
    const createdTable = await createTable(tableData.table, tableData.schema);
    tablesCreated.push(createdTable.id);
  }
  console.log(`Tables created: ${tablesCreated}`);
}());