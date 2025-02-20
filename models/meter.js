const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const meterSchema = new Schema({
    valveStatus:{
        type: String,
        enum: ["open","close"],
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
    lastUpdated: {
        type: Date,
        default: Date.now()
    },
    MACAddress: {
        type: String
    }
})


module.exports = mongoose.model('Meter', meterSchema);