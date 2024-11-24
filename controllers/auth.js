const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req,res,next) => {
    const errors = validationResult(req);
    const email = req.body.email;
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
            email:email,
            password: hashedPw,
            firstName:req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            apartmentNumber: req.body.apartmentNumber,
            age: req.body.age,
            gender: req.body.gender
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


exports.login = async (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    try{
        const user = await User.findOne({email:email})
        
        if(!user){
            const error = new Error('A user with this email could not be found');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual){
            const error = new Error('Wrong Password');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign({
            userId: loadedUser._id.toString()
        },
        process.env.JWT_SECRET,
        {expiresIn: '2h'}
        );
        res.status(200).json({ 
            message: "Logged In Successfully", 
            status: "200",
            user:{
                id: loadedUser._id.toString(),
                username: loadedUser.userName,
                first_name: loadedUser.firstName,
                last_name: loadedUser.lastName,
                email: loadedUser.email,
                phone: loadedUser.phoneNumber.toString(),
                role: loadedUser.role,
                token_data:{
                    access_token: token,
                    token_type: "jwt",
                    expires_in: new Date( Date.now() + 18000000 ).toLocaleTimeString()   // 7200000 = 2 hours  
                }
            }
        });
    
    }
    catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    };
}


