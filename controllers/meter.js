const User = require('../models/user');
const Meter = require('../models/meter');
// const mqtt = require('mqtt');
// const client = mqtt.connect(brokerUrl);


exports.leakageDetected = async (req,res,next) => {
    const meterId = req.body.meterId;
    const meter = await Meter.findById(meterId);
    if(!meter){
        const error = new Error("Couldn't find meter.");
        error.statusCode = 404;
        throw error;
    }
    try{
        // client.publish(`${req.userId}`, 'Your meter detected a leakage');
        meter.leakage = 'true';
        await meter.save();
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}


exports.receiveData = async (req,res,next) => {
    const meter = await Meter.findById(req.body.meterId);
    if(!meter){
        const error = new Error("Couldn't find meter.");
        error.statusCode = 404;
        throw error;
    }
    const data = {
        waterFlowSensor: req.body.waterFlowSensor,
        pressureSensor: req.body.pressureSensor,
        timeStamp: Date.now()
    }
    try{
        meter.data.push(data);
        await meter.save();
        res.status(200).json({
            "message" : "Data Stored Successfully."
        });
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.litersConsumed = async (req,res,next) => {
    const meter = await Meter.findById(req.body.meterId);
    if(!meter){
        const error = new Error("Couldn't find meter.");
        error.statusCode = 404;
        throw error;
    }
    const litersss = req.body.liters;
    try{
        meter.litersConsumed.push({
            liters: meter.litersConsumed[meter.litersConsumed.length - 1].liters + Number(litersss),
            timeStamp: Date.now()
        });
        await meter.save();
        res.status(200).json({
            "message" : "Liters Stored Successfully."
        })
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
    
}