const path = require('path');
const fs = require('fs');

const User = require('../models/user');
const Meter = require('../models/meter');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const pdfDocument = require("pdfkit");

const { validationResult } = require('express-validator');
const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];


exports.getUserData = async (req,res,next) => {
  const userId = req.body.userId;
  const user = await User.findById(userId);
  if(!user){
    const error = new Error("Couldn't find user.")
    error.statusCode = 404;
    throw error;
  }
  try{
    if(userId === req.userId){
      res.status(200).json({
        user: user,
        message: "User fetched successfully."
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
  if(!meter){
    const error = new Error("couldn't find meter");
    error.statusCode = 404;
    throw error
  }
  try{
    if(req.userId === meter.userId.toString()){
      res.status(200).json({
        data: meter.data
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


exports.postEditUser = async (req,res,next) => {
  const userId = req.body.userId;
  if(userId !== req.userId){
    const error = new Error('Not authorized!');
    error.statusCode = 403;
    throw error;
  }
  const updatedPassword = await bcrypt.hash(req.body.password,12);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  try{
      const user = await User.findById(userId);
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.email = req.body.email;;
      user.password = updatedPassword;
      user.username = req.body.username;
      user.phoneNumber = req.body.phoneNumber;
      user.address = req.body.address;
      user.apartmentNumber = req.body.apartmentNumber;
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
  if(!user){
    const error = new Error("Could not find user");
    error.statusCode = 404;
    throw error;
  }
  try{
    user.meters.push(new mongoose.Types.ObjectId(meterId));
    await user.save();
    const meter = new Meter({
      userId : req.userId,
      _id :new mongoose.Types.ObjectId(meterId)
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



exports.getLitersConsumed = async (req,res,next) => {
  const meterId = req.body.meterId;
  const meter = await Meter.findById(meterId);
  if(!meter){
    const error = new Error("couldn't find meter");
    error.statusCode = 404;
    throw error
  }
  try{
    if(req.userId === meter.userId.toString()){
      res.status(200).json({
        liters: meter.litersConsumed
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


exports.getMeterMoney = async (req,res,next) => {
  const meterId = req.body.meterId;
  const meter = await Meter.findById(meterId);
  if(!meter){
    const error = new Error("couldn't find meter");
    error.statusCode = 404;
    throw error
  }
  try{
    if(req.userId === meter.userId.toString()){
      res.status(200).json({
        money: meter.money
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
  const fromDate = req.body.fromDate;
  const toDate = req.body.toDate;
  const meter = await Meter.findById(meterId);
  if(!meter){
    const error = new Error("couldn't find meter");
    error.statusCode = 404;
    throw error
  }
  try{
    if(req.userId === meter.userId.toString()){
      res.status(200).json({
        litersConsumed: meter.litersConsumed.find({ $gte: fromDate, $lte: toDate })
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

  const invoiceName = 'invoice-' + req.userId + month[ new Date().getUTCMonth() ] +'.pdf';
  const invoicePath = path.join('data', 'invoices', invoiceName);
  const pdfDoc = new pdfDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="' +invoiceName+ '" ');
  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);
  pdfDoc.fontSize(26).text('Invoice', {
    underline:true
  });
  pdfDoc.text('----------------------------------------');
  let totalPrice = 100;
  pdfDoc.text('invoice for: '+ user.firstName + ' ' + user.lastName)



  pdfDoc.text('---------------------');
  pdfDoc.fontSize(20).text('Total price: $' + totalPrice);
  pdfDoc.end();

}