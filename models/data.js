const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const dataSchema = new Schema({
    device_id:{
        type: Schema.Types.ObjectId,
        ref: 'Meter',
        required:true
    },
    liters_consumed:{
        type: Number
    },
    flow_rate:{
        type: Number
    },
    pressure_rate:{
        type: Number
    },
    created_at: {
        type: Date,
        required: true
    }
});


module.exports = mongoose.model('Data', dataSchema);
