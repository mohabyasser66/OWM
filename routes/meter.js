const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const meterController = require("../controllers/meter");


router.post("/meter/leakage-detected", meterController.leakageDetected);

router.post("/meter/receive-sensor-data", meterController.receiveData);

router.post("/meter/add-money", meterController.addMoneyToMeter);

router.post("/meter/reset-meter", meterController.resetMeterAtMonthEnd);


module.exports = router;