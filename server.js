require("dotenv").config({});
process.env['GCP_DATASET'] = process.env.NODE_ENV === 'development' ? process.env.DEV_DATASET : process.env.PROD_DATASET;
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const morgan = require("morgan");
const routes = require("./routes");
const semver = require('semver');
const { engines } = require('./package.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(routes);

if (process.env.NODE_ENV === "production") {
  console.log("you are in the production environment");
  
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });
  } else if ((process.env.NODE_ENV = "development")) {    
    console.log("you are in the dev environment");
    
    const version = engines.node;
    if (!semver.satisfies(process.versions.node, version)) {
      console.log(`This app requires Node v16.15.0`)
      process.exit(1);
    }
    app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,PATCH,DELETE");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });
}

app.use("/", async (req, res, next) => {
  res.send({
    message: 'Hello'
  });
});

app.listen(PORT, () => {
  console.log(`Bears... Beets... Battlestar Galactica on Port ${PORT}`);
});