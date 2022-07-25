require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const morgan = require('morgan');
const cors = require('cors');