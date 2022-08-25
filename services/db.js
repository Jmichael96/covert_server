const { BigQuery } = require("@google-cloud/bigquery");
const DATASET = process.env.GCP_DATASET;
const { isEmpty } = require("jvh-is-empty");
const schemas = require("../models/tables.schema");
const tables = require("../models/tableList");
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
    console.log('INSERTED ROW: =>>>>>>>>>>>>>>>>>>>>>', dataRes);
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
      nodemailer('jeffrey.vanhorn@yahoo.com', 'Error in update row method', `This is html err ${JSON.stringify(err)}`);
      // console.log(err);
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

  // buildSetStatement(schema) {
  //   let strStmt = "";
  //   for (let key in schema) {
  //     let col = schema[key].name;
  //     if (key == 0) {
  //       strStmt = `tgt.${col}=src.${col}`;
  //     } else {
  //       strStmt += ` AND tgt.${col}=src.${col}`;
  //     }
  //   }
  //   return strStmt;
  // }

  // buildCondition(conditions) {
  //   let strStmt = "";
  //   for (let key in conditions) {
  //     let col = conditions[key];
  //     if (key == 0) {
  //       strStmt = `tgt.${col}=src.${col}`;
  //     } else {
  //       strStmt += ` AND tgt.${col}=src.${col}`;
  //     }
  //   }
  //   return strStmt;
  // }

  // buildMergeQuery(table, schema, conditions) {
  //   let onCondition = this.buildCondition(conditions);
  //   let onStatement = this.buildSetStatement(schema);

  //   let query = `MERGE INTO \`${this.DATASET}.${table}\` tgt
  //   USING (SELECT * FROM \`${this.DATASET}.TMP_${table}\`) src
  //   ON ${onCondition} WHEN MATCHED THEN UPDATE SET ${onStatement}`;
  //   return query;
  // }

  // async doStuff() {
  //   let insertQuery = `INSERT INTO \`covert_server_prod.REMINDERS\`
  //   (uuid, user_id, reminder_type, date_due, alert_days_prior,
  //   notify, repeat, reminder_time, reminder_message, date_created, terminated) 
  //   VALUES ('2fV3m2nmh79iri7nfjkle2231', 'ecflngroig..rr3.9mVr3hye.V343fnh34h',
  //   'phone', '2022-08-17', 0, 'on due date', false, '17:00:00', 'the time has come!', '2022-08-25',
  //   false)`;
  //   let updateQuery = `UPDATE \`covert_server_prod.REMINDERS\` SET terminated=true WHERE 
  //   uuid='2fV3m2nmh79iri7nfjkle' 
  //   AND user_id='ecflngroig..rr3.9mVr3hye.V343fnh34h'`;
  //   const options = {
  //     // Specify a job configuration to set optional job resource properties.
  //     configuration: {
  //       query: {
  //         query: insertQuery,
  //         useLegacySql: false,
  //       },
  //       labels: {'example-label': 'example-value'},
  //     },
  //   };
  
  //   // Make API request.
  //   const response = await this.bigquery.createJob(options);
  //   const job = response[0];
  
  //   // Wait for the query to finish
  //   const dataRes = await job.getQueryResults(job);
  
  //   // Print the results
  //   console.log('Rows: ', dataRes);
  //   // rows.forEach(row => console.log(row));

  // }
}

(async function(){
  // const db = new DB_Handler();
  // let colData = [{ colName: 'uuid', colVal: 'ecflngroig..rr3.9mVr3hye.V343fnh34h' }];
  // const fetched = await db.fetchQuery('USERS', colData);
  // console.log(fetched);
  // await db.doStuff();
  // let updates = [{ colName: 'terminated', colVal: true }];
  // let conditions = [{ colName: 'uuid', colVal: '2fV3m2nmh79iri7nfjkle2231' }, { colName: 'user_id', colVal: 'ecflngroig..rr3.9mVr3hye.V343fnh34h' }];
  // let res = await db.updateRow(tables.Reminders, updates, conditions);
  // console.log('END RESPONSE: ', res);
}());

module.exports = DB_Handler;
