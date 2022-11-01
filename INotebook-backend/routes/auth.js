const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = 'Shobhitblockchainreact1@$/';

//ROUTE:1 Create a User using POST "/api/auth/createuser" . No login required

router.post('/createuser',[
    body('name','Enter a valid name minimum 3 letters').isLength({ min: 3 }),
    body('email','Enter a valid email').isEmail(),
    body('password','Enter a valid password minimum contain 5 letters').isLength({ min: 5 }),

],async (req,res)=>{
   let success = false;
  // If there are error return Bad request and the errors

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    try {

    // Check wheather user this email exist already
    let user = await User.findOne({email:req.body.email});
    if(user){
      return res.status(400).json({success,error:"Sorry a user with the email is already exists"})
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password,salt);
      //Create a new user

        user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      })
      const data ={
        user:{
          id:user.id
        }
      }
      const authToken = jwt.sign(data,JWT_SECRET);
      success = true;
      // res.json(user)
      res.json({success, authToken})
    }
    catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Occured");
    }
})

//ROUTE:2 verify a User using POST "/api/auth/login" . No login req
router.post('/login',[
  body('email','Enter a valid email').isEmail(),
  body('password','Password cannot be blank').exists(),
],async (req,res)=>{
    let success = false;
     // If there are error return Bad request and the errors
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }
     const {email,password} = req.body;
     try{
        let user = await User.findOne({email})
        if(!user){
          success = false;
          return res.status(400).json({error:'Please Enter the correct Credentials to Login'});
        }

        const passwordCompare =await bcrypt.compare(password,user.password);

        if(!passwordCompare){
          success = false;
          return res.status(400).json({success, error:'Please Enter the correct Credentials to Login'});
        }

        const data ={
          user:{
            id:user.id
          }
        }
        const authToken = jwt.sign(data,JWT_SECRET);
        success = true;
        res.json({success, authToken})
     }
     catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Occured");
    }

})

//ROUTE:3 Get the details of a User using POST "/api/auth/getuser" . Login Required

router.post('/getuser',fetchuser,async (req,res)=>{

  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user)
    
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Occured");
  }

})

module.exports = router