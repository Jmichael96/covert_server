require("dotenv").config({ path: "../.env" });
const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery();
const tables = require("../models/tables.schema");

const createTable = async (tableName, schema) => {
  const datasetId =
    process.argv[2] === "prod"
      ? process.env.PROD_DATASET
      : process.env.DEV_DATASET;
  const options = {
    schema: schema,
    location: "US",
    streamingBuffer: {
      estimatedBytes: "0",
      estimatedRows: "0",
      oldestEntryTime: "0",
    },
  };
  const [table] = await bigquery
    .dataset(datasetId)
    .createTable(tableName, options);
  return table;
};

(async function () {
  let tablesCreated = [];

  try {
    // create tables
    for (let tableData of tables) {
      const createdTable = await createTable(tableData.table, tableData.schema);
      tablesCreated.push(createdTable.id);
    }
    console.log(`Tables created: ${tablesCreated}`);
  } catch (err) {
    console.error(JSON.parse(err.response.body));
  }
})();
