const User = require('../models/user');
const Meter = require('../models/meter');

const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');


exports.getUsers = async(req,res,next) => {
    const users = await User.find();
    try{
        if(!users){
            const error = new Error('no users found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message:'users fetched successfully',
            users:users
        });
    }  
    catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    };
}


exports.getEditUser = async (req,res,next) => {
    const userId = req.body.userId;
    const user = await User.findById(userId);
    try{
        if(!user) {
            const error = new Error('user could not be found.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message:'User Fetched Successfully',
            user: user
        });
    }
    catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    };
}


exports.postEditUser = async (req,res,next) => {
    const userId = req.body.userId;
    const updatedPassword = await bcrypt.hash(req.body.password,12);
    const errors = validationResult(req);
    try{
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }
        const user = await User.findById(userId);
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;;
        user.password = updatedPassword;
        user.username = req.body.username;
        user.phoneNumber = req.body.phoneNumber;
        user.address = req.body.address;
        user.apartmentNumber = req.body.apartmentNumber;
        user.role = req.body.role;
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


exports.deleteUser = async (req,res,next) => {
    const userId = req.body.userId;
    const user = await User.findById(userId);
    try{
        if (!user) {
            const error = new Error('Could not find user.');
            error.statusCode = 404;
            throw error;
        }
        const metersId = user.meters;
        for(let i = 0; i < metersId.length; i++){
            await Meter.findByIdAndDelete(metersId[i]);
        }
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User Deleted.' });
    } 
    catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
}


exports.addMeter = async (req,res,next) => {
    const meterId = req.body.meterId;
    const userId = req.body.userId;
    const user = await User.findById(userId);
    try{
        if(!user){
            const error = new Error("Could not find user");
            error.statusCode = 404;
            throw error;
        }
        user.meters.push(meterId);
        await user.save();
        const meter = new Meter({
            _id : meterId,
          userId : userId,
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

exports.deleteMeter = async (req,res,next) => {
    const meterId = req.body.meterId;
    const userId = req.body.userId;
    const meter = await Meter.findById(meterId);
    const user = await User.findById(userId);
    try{
        if(!meter){
            const error = new Error("Could not find the meter.");
            error.statusCode = 404;
            throw error;
        }
        if(!user){
            const error = new Error("Could not find user to this meter.");
            error.statusCode = 404;
            throw error;
        }
        const meterIndex = user.meters.indexOf(meterId);
        user.meters.splice(meterIndex,1);
        await user.save();
        await Meter.findByIdAndDelete(meterId);
        res.status(201).json({ message: "Meter Deleted Successfully."});
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.addUser = async (req,res,next) => {
    const errors = validationResult(req);
    const password = req.body.password;
    try{
        if(!errors.isEmpty()){
            const error = new Error('validation failed.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const hashedPw = await bcrypt.hash(password,12);
        
        const user = new User({
            email: req.body.email,
            password: hashedPw,
            firstName:req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            apartmentNumber: req.body.apartmentNumber,
            age: req.body.age,
            gender: req.body.gender,
            role: req.body.role
        });
        const result = await user.save();
        res.status(201).json({message:'User created.', userId: result._id});
    }
    catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    };
}