const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const logger = require("morgan");

const app = express();
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(cors());
app.use(logger("dev"));

const server = http.createServer(app);

module.exports = server;
