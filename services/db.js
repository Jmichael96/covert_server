const { BigQuery } = require("@google-cloud/bigquery");
const DATASET = process.env.GCP_DATASET;
const { isEmpty } = require("jvh-is-empty");

// says whether or not to add quotes inside query due to the fact if a value is supposed to be a string, number, ect.
const addQueryQuotes = (value) => {
  if (typeof value === "string") {
    return `'${value}'`;
  } else {
    return value;
  }
};

const concatWhereConditions = (columnData) => {
  let whereString = "";

  if (!isEmpty(columnData)) {
    for (let key in columnData) {
      let colName = columnData[key].colName;
      let colVal = columnData[key].colVal;

      if (key == 0) {
        whereString += ` WHERE ${colName}=${addQueryQuotes(colVal)}`;
      } else if (key >= 1) {
        whereString += ` AND ${colName}=${addQueryQuotes(colVal)}`;
      }
    }
    return (whereString += "");
  } else {
    return (whereString += ";");
  }
};

const concatUpdateConditions = (columnData) => {
  let updateString = "";

  if (!isEmpty(columnData)) {
    for (let key in columnData) {
      let colName = columnData[key].colName;
      let colVal = columnData[key].colVal;

      if (key == 0) {
        updateString += `${colName}=${addQueryQuotes(colVal)}`;
      } else if (key >= 1) {
        updateString += `,${colName}=${addQueryQuotes(colVal)}`;
      }
    }
  } 
  return updateString;
};

module.exports = {
  fetchQuery: async (table, columnData) => {
    const bigquery = new BigQuery();

    let query = `SELECT * FROM ${DATASET}.${table.toUpperCase()}${concatWhereConditions(
      columnData
    )}`;

    const options = {
      query: query,
      location: "US",
    };

    const [job] = await bigquery.createQueryJob(options);

    const [rows] = await job.getQueryResults();

    return rows;
  },
  insertQuery: async (table, data) => {
    const bigquery = new BigQuery();

    try {
      await bigquery.dataset(DATASET).table(table).insert(data);
      
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  updateQuery: async (table, data, cb) => {
    const bigquery = new BigQuery({ 'projectId': 'covertservertest' });
    let query = `UPDATE \`${DATASET}.${table.toUpperCase()}\` SET ${concatUpdateConditions(data.setConditions)}${concatWhereConditions(data.columnData)};`;
 
    // query = `UPDATE \`${DATASET}.${table.toUpperCase()}\` SET terminated = true WHERE uuid=em43y3hemj23_438mev2mmmjj2ofyfm_e4H'`;
    console.log('QUERY ===============>>>>>>>>>', query);
 
    const options = {
      query: query,
      location: 'US',
      // useLegacySql: false
    };
    await bigquery.query(options, (err, data) => {
      if (err) {
        console.log('cb err !!!!!!!!!!========>>>>>>>>>>>>>>', err.response.body);
        // throw err;
        cb(err, data);
        return;
      }

      console.log('========>>>>>>>>>>>>>> Made it!!!! ========>>>>>>>>>>>>>> ', data);
      cb(err, data);
    });
  }
};