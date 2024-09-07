const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const express = require("express");

require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const meterRoutes = require("./routes/meter");

const app = express();

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

app.use('/backend',authRoutes);
app.use('/backend',adminRoutes);
app.use('/backend',userRoutes);
app.use('/backend',meterRoutes);

app.use( (err,req,res,next) => {
  console.log(err);
  const status = err.statusCode || 500;
  const message = err.message;
  const data = err.data;
  res.status(status).json({message:message, data:data});
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

mongoose.connect(process.env.MONGO_URL)
.then(result => {
    app.listen(process.env.PORT);
    console.log("connected to the database");
  })
  .catch((error) => {
    console.log(error);
  });
