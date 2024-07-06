const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/auth');
const User = require('../models/user');



router.post('/login', [
    body('email').isEmail().withMessage('please enter a valid email address'),
    body('password','Password has to be valid').isLength({min:5}).isAlphanumeric().trim()
] ,authController.login);


router.put('/signup',[
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
    body('gender').trim().not().isEmpty(),
    body("age").isNumeric()
], authController.signup);


module.exports = router;