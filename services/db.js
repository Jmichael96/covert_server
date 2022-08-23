const { BigQuery } = require("@google-cloud/bigquery");
const DATASET = process.env.GCP_DATASET;
const { isEmpty } = require("jvh-is-empty");
const schemas = require("../models/tables.schema");
const tables = require("../models/tableList");

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
  }

  // async createTable(newTable, isTmp) {
  //   let chosenSchema;
  //   for (let schema of schemas) {
  //     if (schema.table === newTable) {
  //       chosenSchema = schema.schema;
  //       break;
  //     }
  //   }
  //   try {
  //     if (!isEmpty(chosenSchema)) {
  //       this.options["schema"] = chosenSchema;
  //       this.options["streamingBuffer"] = {
  //         estimatedBytes: "2000",
  //         estimatedRows: "2000",
  //         oldestEntryTime: "(2^64)-1",
  //       };

  //       const [table] = await this.bigquery
  //         .dataset(this.DATASET)
  //         .createTable(`${isTmp && "TMP_"}${newTable}`, this.options);
  //       return table;
  //     } else {
  //       throw new Error("Could not find the schema assigned to this new table");
  //     }
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  async deleteTable(table) {
    try {
      await this.bigquery.dataset(this.DATASET).table(table).delete();
    } catch (err) {
      throw err;
    }
  }

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
    console.log('Rows: ', dataRes);
  };

  async updateRow(table, conditions) {
    let chosenSchema;
    for (let schema of schemas) {
      if (schema.table === table) {
        chosenSchema = schema.schema;
        break;
      }
    }
    // let query = `UPDATE
    // \`covert_server_prod.REMINDERS\` tgt
    // SET terminated = true
    // WHERE tgt.uuid = 'mf3r324_eo23fr4r02er49fjf092HrHry20' AND
    // tgt.user_id = 'v.rj3o83jmr_4fyhf_e.3elfHreejm3.mf9'`;
    const query = this.buildMergeQuery(table, chosenSchema, conditions);
    console.log(query);
    return await this.bigquery
      .createQueryJob(query)
      .then(function (data) {
        const job = data[0];
        console.log("job data!!!!! ", job);
        const apiResponse = data[1];
        console.log("api descructed!!!!!! ", apiResponse);
        return job.getQueryResults();
      })
      .catch((err) => {
        // console.log('this is an error ', err);
        return err;
      });
  }

  buildSetStatement(schema) {
    let strStmt = "";
    for (let key in schema) {
      let col = schema[key].name;
      if (key == 0) {
        strStmt = `tgt.${col}=src.${col}`;
      } else {
        strStmt += ` AND tgt.${col}=src.${col}`;
      }
    }
    return strStmt;
  }

  buildCondition(conditions) {
    let strStmt = "";
    for (let key in conditions) {
      let col = conditions[key];
      if (key == 0) {
        strStmt = `tgt.${col}=src.${col}`;
      } else {
        strStmt += ` AND tgt.${col}=src.${col}`;
      }
    }
    return strStmt;
  }

  buildMergeQuery(table, schema, conditions) {
    let onCondition = this.buildCondition(conditions);
    let onStatement = this.buildSetStatement(schema);

    let query = `MERGE INTO \`${this.DATASET}.${table}\` tgt
    USING (SELECT * FROM \`${this.DATASET}.TMP_${table}\`) src
    ON ${onCondition} WHEN MATCHED THEN UPDATE SET ${onStatement}`;
    return query;
  }

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
  }

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
  }

  // says whether or not to add quotes inside query due to the fact if a value is supposed to be a string, number, ect.
  addQueryQuotes(value) {
    if (typeof value === "string") {
      return `'${value}'`;
    } else {
      return value;
    }
  };

  // async fetchTables() {
  //   const [tables] = await this.bigquery.dataset(this.DATASET).getTables();
  //   console.log('Tables:');
  //   tables.forEach(async table => {
  //     let data = await table.get();
  //     console.log('=======================================================')
  //     console.log(data[0].metadata);
  //     console.log('=======================================================')
  //     // console.log(data[1])
  //   });
  // };

  async doStuff() {
    let insertQuery = `INSERT INTO \`covert_server_prod.REMINDERS\`
    (uuid, user_id, reminder_type, date_due, alert_days_prior,
    notify, repeat, reminder_time, reminder_message, date_created, terminated) 
    VALUES ('2fV3m2nmh79iri7nfjkle', 'ecflngroig..rr3.9mVr3hye.V343fnh34h',
    'phone', '2022-08-17', 0, 'on due date', false, '17:00:00', 'the time has come!', '2022-08-25',
    false)`;
    let updateQuery = `UPDATE \`covert_server_prod.REMINDERS\` SET terminated=true WHERE 
    uuid='2fV3m2nmh79iri7nfjkle' 
    AND user_id='ecflngroig..rr3.9mVr3hye.V343fnh34h'`;
    const options = {
      // Specify a job configuration to set optional job resource properties.
      configuration: {
        query: {
          query: updateQuery,
          useLegacySql: false,
        },
        labels: {'example-label': 'example-value'},
      },
    };
  
    // Make API request.
    const response = await this.bigquery.createJob(options);
    console.log('res ==== ', response);
    const job = response[0];
  
    // Wait for the query to finish
    const dataRes = await job.getQueryResults(job);
  
    // Print the results
    console.log('Rows: ', dataRes);
    // rows.forEach(row => console.log(row));
  }
}
module.exports = DB_Handler;
