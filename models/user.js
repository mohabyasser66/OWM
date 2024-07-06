const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName:{
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    userName:{
        type: String,
        required: true
    },
    phoneNumber:{
        type: Number,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    apartmentNumber:{
        type: Number,
        required:true
    },
    role:{
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    meters: [ 
        {
            type: Schema.Types.ObjectId,
            ref:"Meter"
        }
        
    ],
    gender:{
        type: String,
        enum: ['male', 'female'],
    },
    age:{
        type: Number,
        required: true
    },
    resetPasswordToken:{
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
})

module.exports = mongoose.model('User', userSchema);