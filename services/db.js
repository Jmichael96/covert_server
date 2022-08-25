const { BigQuery } = require("@google-cloud/bigquery");
const DATASET = process.env.GCP_DATASET;
const { isEmpty } = require("jvh-is-empty");
const nodemailer = require('./nodemailer');

class DB_Handler {
  constructor() {
    this.options = {
      configuration: {
        query: {
          query: ``,
          useLegacySql: false
        }
      },
      location: "US",
    };
    this.bigquery = new BigQuery();
    this.DATASET = DATASET;
  }

  async fetchQuery(table, columnData) {
    let query = `SELECT * FROM ${
      this.DATASET
    }.${table.toUpperCase()}${this.concatWhereConditions(columnData)}`;

    this.options["query"] = query;

    try {
      const [job] = await this.bigquery.createQueryJob(this.options);
      const [rows] = await job.getQueryResults();
      return rows;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  extractObjKeys(obj) {
    return Object.keys(obj).map((a) => a);
  };

  extractObjValues(obj) {
    let str = ``;
    let i = 0;
    for (let key in obj) {
      if (i == 0) {
        str += `${typeof(obj[key]) === 'string' ? `'${obj[key].replace(/'/g, "\\'")}'` : obj[key]}`;
      } else if (i >= 1){
        str += `, ${typeof(obj[key]) === 'string' ? `'${obj[key].replace(/'/g, "\\'")}'` : obj[key]}`;
      }
      i+=1
    }
    return str;
  };

  async insertRow(table, data) {
    let keys = this.extractObjKeys(data);
    let vals = this.extractObjValues(data);

    let insertQuery = `INSERT INTO \`${this.DATASET}.${table}\` (${keys.join(', ')}) VALUES (${vals})`;
    this.options.configuration.query.query = insertQuery
    
    const response = await this.bigquery.createJob(this.options);

    console.log('res ==== ', response);
    const job = response[0];
  
    // Wait for the query to finish
    const dataRes = await job.getQueryResults(job);
  
    // Print the results
    console.log('INSERTED ROW: =>>>>>>>>>>>>>>>>>>>>>');
  };

  async updateRow(table, updates, conditions) {

    let updatedString = this.concatUpdateConditions(updates);
    let conditionString = this.concatWhereConditions(conditions);
    let query = `UPDATE \`${this.DATASET}.${table}\` SET ${updatedString} ${conditionString}`;

    this.options.configuration.query.query = query;

    try {
      const response = await this.bigquery.createJob(this.options);
      let job = response[0];
      return job;
    } catch (err) {
      console.log('ERROR: =========>>>>>>>>>>');
      await nodemailer('jeffrey.vanhorn@yahoo.com', 'Error in update row method', `This is html err ${JSON.stringify(err)}`);
      throw err;
    }
  };

  concatUpdateConditions(columnData) {
    let updateString = "";

    if (!isEmpty(columnData)) {
      for (let key in columnData) {
        let colName = columnData[key].colName;
        let colVal = columnData[key].colVal;
        if (key == 0) {
          updateString += `${colName}=${this.addQueryQuotes(colVal)}`;
        } else if (key >= 1) {
          updateString += `,${colName}=${this.addQueryQuotes(colVal)}`;
        }
      }
    }
    return updateString;
  };

  concatWhereConditions(columnData) {
    let whereString = "";

    if (!isEmpty(columnData)) {
      for (let key in columnData) {
        let colName = columnData[key].colName;
        let colVal = columnData[key].colVal;

        if (key == 0) {
          whereString += ` WHERE ${colName}=${this.addQueryQuotes(colVal)}`;
        } else if (key >= 1) {
          whereString += ` AND ${colName}=${this.addQueryQuotes(colVal)}`;
        }
      }
      return (whereString += "");
    } else {
      return (whereString += ";");
    }
  };

  // says whether or not to add quotes inside query due to the fact if a value is supposed to be a string, number, ect.
  addQueryQuotes(value) {
    if (typeof value === "string") {
      return `'${value}'`;
    } else {
      return value;
    }
  };
};

module.exports = DB_Handler;
