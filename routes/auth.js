const express = require('express');
//const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, name, password } = req.body;
   // console.log("in signup",email,name,password);
    const user = new User({ email, name, password });
    await user.save();
   // console.log("data inserted signuped!!");
    res.redirect('/signin');
  } catch (error) {
    console.error(error);
    res.render('signup',{message:"Email already exist!"});

  }
});

// Signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    //console.log("in signin ",email,password);
    const user = await User.findOne({ email });
   // if (user && (await bcrypt.compare(password, user.password))) {
   console.log("user forund is ",user);
    if(user){
      if(user.password===password)
      {
      req.session.userId = user._id;
      res.redirect('/home');
      }
      else{
        res.render('signin',{message:"Password is incorrect !"});

      }
    } else {
      res.render('signin',{message:"There is no account on given Email !"});
    }
  } catch (error) {
    console.error(error);
    res.redirect('/signin');
  }
});

module.exports = router;
