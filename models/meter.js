const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const meterSchema = new Schema({
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
    balance:{
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    money:[{
        amount:{
            type: Number,
            required: true,
            min: 0
        },
        created_at:{
            type: Date,
            default: Date.now()
        }
    }],
    lastUpdated: {
        type: Date,
        default: Date.now()
    },
    MACAddress: {
        type: String
    }
})



meterSchema.methods.updateBalance = function(amount) {
    if (amount < 0) {
        throw new Error('Amount must be positive');
    }
    this.balance += amount;
    this.money.push({ amount:amount });
    this.lastUpdated = Date.now();
    return this.save();
};

meterSchema.methods.resetMonthlyBalance = function() {
    this.balance = 0;
    this.money = [];
    this.lastUpdated = Date.now();
    return this.save();
};


module.exports = mongoose.model('Meter', meterSchema);