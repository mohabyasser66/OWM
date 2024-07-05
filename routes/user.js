const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');


router.post("/user/get-user-data", isAuth, userController.getUserData);

router.post("/user/get-meter-data", isAuth, userController.getMeterData);


router.post('/user/edit-user', isAuth,
[
    body('firstName').trim().not().isEmpty(),
    body('lastName').trim().not().isEmpty(),
    body('userName').trim().not().isEmpty(),
    body("phoneNumber", "Please enter your phone number").isNumeric().not().isEmpty(),
    body('address').trim().not().isEmpty(),
    body('apartmentNumber').isAlphanumeric().trim().not().isEmpty(),
    body('password','please enter an alphanumeric password with at least 5 characters').isLength({min:5}).isAlphanumeric().trim(),
    body('email').isEmail().withMessage('please enter a valid email.').normalizeEmail()
] 
, userController.postEditUser);

router.post("/user/add-meter", isAuth, userController.userAddMeter);

router.post("/user/get-liters", isAuth, userController.getLitersConsumed);

router.post("/user/get-money", isAuth, userController.getMeterMoney);

router.post("/user/get-water-consumption", isAuth, userController.getConsumption);

router.post("/user/payment", isAuth, userController.payment);



module.exports = router;
