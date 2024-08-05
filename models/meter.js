const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const meterScehma = new Schema({
    valveStatus:{
        type: String,
        enum: ["open","closed"],
        default: "open"
    },
    name:{
        type: String
    },
    token: {
        type: String
    },
    start_read:{
        type: String,
        enum: ["true", "false"],
        default: "true"
    },
    connection_status:{
        type: String,
        enum: ["Connected", "Disconnected"],
        default: "Connected"
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    money:[{
        amount:{
            type: Number,
            required: true
        },
        created_at:{
            type: Date,
            required: true
        }
    }]
})



module.exports = mongoose.model('Meter', meterScehma);