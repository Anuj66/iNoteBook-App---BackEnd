const express = require("express");
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/FetchUser');

const router = express.Router();
const jwt_key = "This is a secret key"

// Route to create a user
router.post('/createUser',[
    body('name', 'Enter a name with atleast 3 characters').isLength({min: 3}),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Length of password should be atleast 5 characters').isLength({min: 5})
] ,async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, error: errors.array() });
    }

    try{
        let user = await User.findOne({email: req.body.email})
        if(user){
            return res.status(400).json({success, error: 'User with email already exists'})
        }

        const salt = await bcrypt.genSalt(10);
        const secPassword = await bcrypt.hash(req.body.password, salt)

        user = await User.create({
            name: req.body.name,
            password: secPassword,
            email: req.body.email
        }).then(user => {
            const payload = {
                user: {
                    id: user.id
                }
            }
            const jwt_token = jwt.sign(payload, jwt_key)
            // console.log(jwt_token)
            success = true
            res.json({success, jwt_token})
        }).catch(error => {
            res.json({success, error: 'Please send valid credentials'})
        })
    }catch(error){
        return res.status(500).json({success, error: 'Some Error has occurred'})
    }
})

// Route to Login a user using credentials
router.post('/login', [
    body('email', 'Please enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
],async (req, res) => {

    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    const {email, password} = req.body;
    try{
        let user = await User.findOne({email})

        if(!user){
            return res.status(400).json({success, error: 'Please enter the correct credentials!'})
        }

        const passwordCompare = await bcrypt.compare(password, user.password)

        if(!passwordCompare){
            return res.status(400).json({success, error: 'Please enter the correct credentials!'})
        }

        const payload = {
            user: {
                id: user.id
            }
        }
        const jwt_token = jwt.sign(payload, jwt_key)
        success = 'true'
        return res.json({success, jwt_token})

    }catch(error){
        return res.status(500).json({success, error: 'Some error has occurred'})
    }
})

//Route to get details of Loggen-in User
router.post('/getUser',fetchUser ,async (req, res) => {
    try{
        let userId = req.user.id
        const user = await User.findById(userId).select('-password')
        return res.status(200).send(user)
    }catch(error){
        return res.status(501).json({error: 'Internal Server Error'})
    }
})

module.exports = router