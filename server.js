const express = require("express");
const connectMongo = require("./config/db");
const connect = require("./config/db");
const client = require("./config/db");
const app = express();
const promise = require("./config/db");
connectMongo();
app.use("/", (req, res, next) => {
  res.send("Working");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);
