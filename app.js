const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const express = require("express");
const mqtt = require("mqtt");

require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const meterRoutes = require("./routes/meter");

const app = express();

const brokerUrl = "mqtt://localhost";
// const topics = ["leakage-detection", "motor-control-valve"];

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(authRoutes);
app.use(adminRoutes);
app.use(userRoutes);
app.use(meterRoutes);

// const client = mqtt.connect(brokerUrl);
// client.on('connect', () => {
//   console.log('Connected to MQTT broker');
// });

// client.on('error', (error) => {
//   console.error('Error:', error);
// });

app.use((err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || 500;
  const message = err.message;
  const data = err.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then((result) => {
    app.listen(3000);
    console.log("connected to the database");
  })
  .catch((error) => {
    console.log(error);
  });
