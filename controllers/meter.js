const User = require('../models/user');
const Meter = require('../models/meter');
const Data = require('../models/data');
const mqtt = require('mqtt');


const client = mqtt.connect("mqtt://localhost");
client.on('connect', () => {
    console.log('Connected to MQTT broker');
});
  
client.on('error', (error) => {
console.error('Error:', error);
});

async function connectAll() {
    let usersIds = [];
    const users = await User.find();
    users.forEach(user => {
        usersIds.push(user._id.toString());
    });
    client.subscribe(usersIds);
    console.log(usersIds);
}

connectAll();


client.on('message', (message) => {
    console.log(message);
})

exports.leakageDetected = async (req,res,next) => {
    const meterId = req.body.meterId;
    const userId = req.body.userId;
    const meter = await Meter.findById(meterId);
    const user = await User.findById(userId);
    try{
        if(!meter || !user){
            const error = new Error("Couldn't find meter or its owner.");
            error.statusCode = 404;
            throw error;
        }
        client.publish(`${userId}`, "Leakage Detected on Your Meter", (err) => {
            if (err) {
                console.error('Failed to publish MQTT message:', err);
                return res.status(500).json({ error: 'Failed to send notification' });
            }
    
            console.log(`Published leakage notification for user: ${user.firstName} ${user.lastName}, with ID: ${userId}`);
            res.status(200).json({ message: 'Notification sent successfully' });
        });
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


// exports.addMoneyToMeter = async (req,res,next) => {
//     const meter = await Meter.findById(req.body.meterId);
//     const money = Number(req.body.money);
//     try{
//         if(!meter){
//             const error = new Error("Couldn't find meter.");
//             error.statusCode = 404;
//             throw error;
//         }
//         await meter.updateBalance(money);
//         res.status(200).json({
//             "Message": "Money Updated",
//             "Balance": meter.balance
//         });
//     }
//     catch(err){
//         if(!err.statusCode){
//             err.statusCode = 500;
//         }
//         next(err);
//     }
// }


// exports.resetMeterAtMonthEnd = async (req,res,next) =>{
//     const meter = await Meter.findById(req.body.meterId);
//     try{
//         if (!meter) {
//             throw new Error('Meter not found');
//         }
//         await meter.resetMonthlyBalance();
//         res.status(200).json({
//             "Message": "Meter Reset Successfully.",
//             "Money": meter.balance
//         })
//     }
//     catch(err){
//         if(!err.statusCode){
//             err.statusCode = 500;
//         }
//         next(err);
//     }
// }


exports.checkMAC = async (req,res,next) => {
    const mac = req.body.mac;
    const meter = await Meter.find({ MACAddress: mac });
    try{
        if(!meter){
            const error = new Error("Couldn't find meter.");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            "userId": meter.userId,
            "meterId": meter._id
        });
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}