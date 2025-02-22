const path = require('path');
const fs = require('fs');

const User = require('../models/user');
const Meter = require('../models/meter');
const Data = require("../models/data");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const mqtt = require('mqtt');

const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const tierRates = [
  { limit: 30, rate: 2.5 },
  { limit: 50, rate: 3.0 },
  { limit: Infinity, rate: 3.5 }
];

const calculateWaterBill = (consumption) => {
  let total = 0;
  let remainingConsumption = consumption;
  for (const tier of tierRates) {
    if (remainingConsumption > 0) {
      const applicableConsumption = Math.min(remainingConsumption, tier.limit);
      total += applicableConsumption * tier.rate;
      remainingConsumption -= applicableConsumption;
    }
  }
  return total.toFixed(2);
};

const client = mqtt.connect("mqtt://localhost");
client.on('connect', () => {
    console.log('Connected to MQTT broker');
});



exports.getUserData = async (req,res,next) => {
  const userId = req.body.userId;
  const user = await User.findById(userId);
  try{
    if(!user){
      const error = new Error("Couldn't find user.")
      error.statusCode = 404;
      throw error;
    }
    if(userId === req.userId){
      res.status(200).json({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        apartmentNumber: user.apartmentNumber,
        gender: user.gender,
        age: user.age,
        meters: user.meters
      });
    }
    else{
      res.status(401).json({
        message: "Unauthorized, Not Your Data."
      })
    }
    
  }
  catch(err){
      if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
  }
}



exports.getMeterData = async (req,res,next) => {
  const meterId = req.body.meterId;
  const meter = await Meter.findById(meterId);
  const data = await Data.find({ device_id: meterId }).select("liters_consumed flow_rate pressure_rate created_at -_id");
  try{
    if(!meter){
      const error = new Error("couldn't find meter");
      error.statusCode = 404;
      throw error
    }
    if(!data){
      const error = new Error("couldn't find any data to this meter");
      error.statusCode = 404;
      throw error
    }
    if(req.userId === meter.userId.toString()){
      res.status(200).json({
        message: "Meter Data Fetched Successfully",
        status: "200",
        IoTDevice: {
          id: meter._id.toString(),
          name: meter.name,
          token: meter.token,
          flow_status: meter.valveStatus,
          start_read: meter.start_read,
          connection_status: meter.connection_status,
          readings: data
        }
      });
    }
    else{
      res.status(401).json({
        message: 'Unauthorized, Not Your Meter'
      });
    }
  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.getAllMetersData = async (req,res,next) => {
  let IoTDevices = [];
  let meterAndData = {};
  try{
    const user = await User.findById(req.userId);
    if(!user){
      const error = new Error("Couldn't find user.")
      error.statusCode = 404;
      throw error;
    }
    for(let i = 0; i < user.meters.length; i++){
      let meters = await Meter.findById(user.meters[i]);
      let meterData = await Data.find({ device_id: meters._id}).select("liters_consumed flow_rate pressure_rate created_at -_id");
      meterAndData = {
        id:meters._id, 
        name:meters.name, 
        token:meters.token, 
        start_read:meters.start_read, 
        connection_status:meters.connection_status, 
        readings:meterData
      };
      IoTDevices.push(meterAndData);
    }
    res.status(200).json({ 
      status: "200",
      message: "All Data Fetched Successfully.",
      IoTDevices: IoTDevices
    });
  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.postEditUser = async (req,res,next) => {
  const userId = req.body.userId;
  // const updatedPassword = await bcrypt.hash(req.body.password,12);
  const errors = validationResult(req);
  try{
    if(userId !== req.userId){
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const user = await User.findById(userId);
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.email = req.body.email;
    // user.password = updatedPassword;
    user.username = req.body.username;
    user.phoneNumber = req.body.phoneNumber;
    user.address = req.body.address;
    user.apartmentNumber = req.body.apartmentNumber;
    user.age = req.body.age;
    const result = await user.save();
    res.status(200).json({
        message:'User Updated',
        user: result
    });
  }
  catch(err) {
      if (!err.statusCode) {
          err.statusCode = 500;
      }
      next(err);
  };
}



exports.userAddMeter = async (req,res,next) => {
  const meterId = req.body.meterId;
  const user = await User.findById(req.userId);
  const existentMeter = await Meter.findById(meterId);
  try{
    if(!user){
      const error = new Error("Could not find user");
      error.statusCode = 404;
      throw error;
    }
    else if(existentMeter){
      const error = new Error("A meter with this ID already exist.");
      error.statusCode = 409;
      throw error;
    }
    user.meters.push(meterId);
    await user.save();
    const meter = new Meter({
      _id : meterId,
      userId : req.userId,
      token: meterId,
      name: user.userName + " Meter"
    });
    await meter.save();
    res.status(200).json({
      message: "Meter Added Successfully."
    });
  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.getMeterMoney = async (req,res,next) => {
  const meterId = req.body.meterId;
  const meter = await Meter.findById(meterId).select("balance money.amount money.created_at userId");
  try{
    if(!meter){
      const error = new Error("couldn't find meter");
      error.statusCode = 404;
      throw error
    }
    if(req.userId === meter.userId.toString()){
      res.status(200).json({
        Balance: meter.balance,
        Money: meter.money
      });
    }
    else{
      res.status(401).json({
        message: 'Unauthorized, Not Your Meter'
      });
    }
  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.getConsumption = async (req,res,next) => {
  const meterId = req.body.meterId;
  const fromDate = new Date(req.body.fromDate);
  const toDate = new Date(req.body.toDate);
  const meter = await Meter.findById(meterId);
  try{
    if(!meter){
      const error = new Error("Couldn't find meter");
      error.statusCode = 404;
      throw error
    }
    if (!fromDate || !toDate || fromDate > toDate) {
      const error = new Error('Invalid date range');
      error.statusCode = 404;
      throw error
    }
    if(req.userId === meter.userId.toString()){
      const meterRecords = await Data.find({
        device_id: meterId,
        created_at: {
          $gte: fromDate,
          $lte: toDate
        }
      }).select("liters_consumed created_at -_id");
      res.status(200).json({
        litersConsumed: meterRecords
      });
    }
    else{
      res.status(401).json({
        message: 'Unauthorized, Not Your Meter'
      });
    }
  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
}



exports.payment = async (req,res,next) => {
  const user = await User.findById(req.userId);
  let totalBalance = 0;
  try{
  if(!user){
    const error = new Error("couldn't find user");
    error.statusCode = 404;
    throw error
  }
  for(let id of user.meters) {
    let meter = await Meter.findById(id);
    if(!meter){
      const error = new Error("couldn't find meter");
      error.statusCode = 404;
      throw error
    }
    totalBalance += meter.balance;
  };
  res.status(200).json({
    totalBalance: totalBalance
  });
  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.forgetPassword = async (req,res,next) => {
  const user = await User.findOne({ email: req.body.email});
  try{
    if (!user) {
      const error = new Error("Could not find user");
      error.statusCode = 404;
      throw error;
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'oracleowm@gmail.com',
        pass: 'rhsd wtov blza evqm'
      },
    });
    transporter.sendMail({
      to: req.body.email,
      subject: "Password Reset",
      html: `
            <p>you requested a password reset.</p>
            <p>click this <a href="https://owmmeter.com/new-password/${resetToken}">Link</a> to set a new password.</p>
          `
    },(err,response) => {
      if (err) {
        return res.status(500).json({ message: 'Error sending email' });
      }
      res.status(200).json({ message: 'Password reset link sent' });
    });
  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.resetPassword = async (req,res,next) => {
  const token = req.body.token;
  const newPassword = req.body.newPassword;
  try{
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
  
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
  
    await user.save();
  
    res.status(200).json({ message: 'Password reset successfully' });
  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.changePassword = async (req,res,next) => {
  const user = await User.findById(req.userId);
  try{
    if(!user){
      const error = new Error("Could not find user");
      error.statusCode = 404;
      throw error;
    }
    const isEqual = await bcrypt.compare(req.body.currentPassword,user.password);
    if(isEqual){
      const newPassword = req.body.newPassword;
      const newHashedPassword = await bcrypt.hash(newPassword,12);
      user.password = newHashedPassword;
      await user.save();
      res.status(200).json({
        message : "Password Changed Successfully."
      })
    }
    else{
      res.status(404).json({
        message: "The Password is incorrect."
      })
    }
  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  } 
  
}

exports.changePowerStatus = async (req,res,next) => {
  const meterId = req.body.meterId;
  const meter = await Meter.findById(meterId);
  try{
    if(!meter){
      const error = new Error("Could not find meter");
      error.statusCode = 404;
      throw error;
    }
    if(req.userId !== meter.userId.toString()){
      const error = new Error("Not Authorized, Not Your Meter");
      error.statusCode = 401;
      throw error;
    }
    if(meter.connection_status == "Connected"){
      meter.connection_status = "Disconnected";
      meter.start_read = "false";
      await meter.save();
      res.status(200).json({
        status: "200",
        power_status: meter.connection_status,
        start_read: meter.start_read
      });
    }
    else if(meter.connection_status == "Disconnected"){
      meter.connection_status = "Connected";
      meter.start_read = "true";
      await meter.save();
      res.status(200).json({
        status: "200",
        powerStatus: meter.connection_status,
        start_read: meter.start_read
      });
    }
    else{
      const error = new Error("This meter power status is malformed");
      error.statusCode = 404;
      throw error;
    }
  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
  
}

exports.toggleValve = async (req,res, next) => {
    const meterId = req.body.meterId;
    const meter = await Meter.findById(meterId);
    try {
        if(!meter){
            const error = new Error("Couldn't find meter or its owner.");
            error.statusCode = 404;
            throw error;
        }
        if(meter.valveStatus === 'open') {
            meter.valveStatus = 'close';
            await meter.save();
        }
        else{
            meter.valveStatus = 'open';
            await meter.save();
        }
        client.publish(`valve${meterId}`, meter.valveStatus, (err) => {
            if (err) {
                console.error('Failed to publish MQTT message:', err);
                return res.status(500).json({ error: 'Failed to toggle valve' });
            }
            res.status(200).json({ message: `valve is ${meter.valveStatus}` });
        });
    }catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}


exports.calculateBill = async (req,res) => {
  let total = 0.00;
  const user = await User.findById(req.userId);
  const userMeters = user.meters.map(async (meter) => {
    let singlemeter = await Data.find({device_id: meter.toString(), created_at: Date.month()}).select("liters_consumed");
    console.log(singlemeter);
  })
}

// user -> his meters -> search for each meter consumption over the month -> calculate meter bill in that month
// -> return the bill of that meter and go to his next meter



