const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const meterScehma = new Schema({
    valveStatus:{
        type: String,
        enum: ["open","closed"],
        default: "open"
    },
    // leakage:{
    //     type: String,
    //     enum: ['true','false'],
    //     default: 'false'
    // },
    litersConsumed:[{
        liters:{
            type: Number,
            default: 0
        },
        timeStamp:{
            type: Date,
            required: true
        }
    }],
    data:[{
        waterFlowSensor:{
            type: Number
        },
        pressureSensor:{
            type: Number
        },
        timeStamp: {
            type: Date,
            required: true
        }
    }],
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    money:[{
        amount:{
            type: Number,
            required: true
        },
        timeStamp:{
            type: Date,
            required: true
        }
    }]
})



module.exports = mongoose.model('Meter', meterScehma);