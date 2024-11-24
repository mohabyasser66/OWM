const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const billSchema = new Schema({
    money:{
        type: Number,
        required: true
    },
    month:{
        type: Date,
        required: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    meterId:{
        type: Schema.Types.ObjectId,
        ref: "Meter"
    }
});

module.exports = mongoose.model('Bill', billSchema);
