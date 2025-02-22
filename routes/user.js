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
    body('email').isEmail().withMessage('please enter a valid email.'),
    body('age').isNumeric()
] 
, userController.postEditUser);

router.post("/user/add-meter", isAuth, userController.userAddMeter);

router.post("/user/get-money", isAuth, userController.getMeterMoney);

router.post("/user/get-water-consumption", isAuth, userController.getConsumption);

router.get("/user/payment", isAuth, userController.payment);

router.post("/user/forget-password", userController.forgetPassword);

router.post("/user/reset-password", userController.resetPassword);

router.post("/user/change-password", isAuth, userController.changePassword);

router.get("/user/get-all-data", isAuth, userController.getAllMetersData);

router.post("/user/change-power", isAuth, userController.changePowerStatus);

router.post("/user/calculate-bill", isAuth, userController.calculateBill);

router.post("/user/valve-status", isAuth, userController.toggleValve);

module.exports = router;
