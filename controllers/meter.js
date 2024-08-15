const User = require('../models/user');
const Meter = require('../models/meter');
const Data = require('../models/data');
// const mqtt = require('mqtt');
// const client = mqtt.connect(brokerUrl);


exports.leakageDetected = async (req,res,next) => {
    const meterId = req.body.meterId;
    const meter = await Meter.findById(meterId);
    try{
        if(!meter){
            const error = new Error("Couldn't find meter.");
            error.statusCode = 404;
            throw error;
        }
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
    const meter = await Meter.findById(req.body.device_id);
    try{
        if(!meter){
            const error = new Error("Couldn't find meter.");
            error.statusCode = 404;
            throw error;
        }
        const data = new Data({
            device_id: req.body.device_id,
            flow_rate: req.body.flow_rate,
            pressure_rate: req.body.pressure_rate,
            liters_consumed: req.body.liters_consumed,
            created_at: Date.now()
        });
        // meter.data.push(data);
        await data.save();
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

// exports.litersConsumed = async (req,res,next) => {
//     const meter = await Meter.findById(req.body.meterId);
//     const litersss = req.body.liters;
//     try{
//         if(!meter){
//             const error = new Error("Couldn't find meter.");
//             error.statusCode = 404;
//             throw error;
//         }
//         if(meter.liters_consumed.length > 0){
//             meter.liters_consumed.push({
//                 liters: meter.liters_consumed[meter.liters_consumed.length - 1].liters + Number(litersss),
//                 timeStamp: Date.now()
//             });
//         }
//         else{
//             meter.liters_consumed.push({
//                 liters: Number(litersss),
//                 timeStamp: Date.now()
//             });
//         }
//         await meter.save();
//         res.status(200).json({
//             "message" : "Liters Stored Successfully."
//         })
//     }
//     catch(err){
//         if(!err.statusCode){
//             err.statusCode = 500;
//         }
//         next(err);
//     }
    
// }


exports.addMoneyToMeter = async (req,res,next) => {
    const meter = await Meter.findById(req.body.meterId);
    const money = req.body.money;
    try{
        if(!meter){
            const error = new Error("Couldn't find meter.");
            error.statusCode = 404;
            throw error;
        }
        await meter.updateBalance(money);
        res.status(200).json({
            "Message": "Money Updated",
            "Money": meter.balance
        });
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}


exports.resetMeterAtMonthEnd = async (req,res,next) =>{
    const meter = await Meter.findById(req.body.meterId);
    try{
        if (!meter) {
            throw new Error('Meter not found');
        }
        await meter.resetMonthlyBalance();
        res.status(200).json({
            "Message": "Meter Reset Successfully.",
            "Money": meter.balance
        })
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}