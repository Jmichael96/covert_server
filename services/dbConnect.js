const { BigQuery } = require("@google-cloud/bigquery");


const serveQuery = async (query) => {
  const bqClient = new BigQuery();
  const options = {
    query: query,
    location: 'US'
  };
  // await bqClient.query(options);
};

const searchFromBigQuery = async () => {
  const bigqueryClient = new BigQuery();
  // The SQL query to run
  const sqlQuery = "SELECT * from `first_covert_server_dataset.USER_DATA`";

  const options = {
    query: sqlQuery,
    // Location must match that of the dataset(s) referenced in the query.
    location: "US",
  };

  // Run the query
  const [rows] = await bigqueryClient.query(options);
  console.log(rows);
  return rows;
};

module.exports = {
  serveQuery
};
