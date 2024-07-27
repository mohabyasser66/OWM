const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const restrictTo = require('../middleware/restrict-to');
const User = require("../models/user");
const { body } = require("express-validator");

const router = express.Router();


router.get('/admin/users',  isAuth, restrictTo('admin'),adminController.getUsers);

router.post("/admin/add-user", isAuth, restrictTo("admin"), [
    body('email').isEmail().withMessage('please enter a valid email.').custom( (value, {req}) => {
        return User.findOne({email: value}).then(userDoc => {
            if(userDoc) {
              return Promise.reject('Email exists already, please pick a different one');
            }
        })
    }).normalizeEmail(),
    body('password','please enter an alphanumeric password with at least 5 characters')
    .isLength({min:5})
    .isAlphanumeric().trim(),
    body('firstName').trim().not().isEmpty(),
    body('lastName').trim().not().isEmpty(),
    body('userName').trim().not().isEmpty(),
    body("phoneNumber", "Please enter your phone number").isNumeric().not().isEmpty(),
    body('address').trim().not().isEmpty(),
    body('apartmentNumber').isAlphanumeric().trim().not().isEmpty(),
    body('age').isNumeric().not().isEmpty(),
    body('gender').not().isEmpty(),
] ,adminController.addUser);

router.post('/admin/get-user-data', isAuth, restrictTo('admin'), adminController.getEditUser);

router.post('/admin/edit-user', isAuth, restrictTo('admin'),
// [
//     body('firstName').trim(),
//     body('lastName').trim(),
//     body('userName').trim(),
//     body("phoneNumber").isNumeric(),
//     body('address').trim(),
//     body('apartmentNumber').isAlphanumeric().trim(),
//     body('password','please enter an alphanumeric password with at least 5 characters').isLength({min:5}).isAlphanumeric().trim(),
//     body('email').isEmail().withMessage('please enter a valid email.').normalizeEmail()
// ] 
//, 
adminController.postEditUser);


router.post('/admin/delete-user', isAuth, restrictTo('admin'), adminController.deleteUser);

router.post("/admin/add-meter", isAuth, restrictTo("admin"), adminController.addMeter);

router.post("/admin/delete-meter", isAuth, restrictTo("admin"), adminController.deleteMeter);

module.exports = router;
