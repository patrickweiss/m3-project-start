const express = require("express");
const passport = require('passport');
const router = express.Router();
const User = require("../models/User");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;




router.post("/signup", (req, res) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const username = req.body.username;
  const userPassword = req.body.password;


  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      console.log("User with username exists already:"+username);
      res.status(200).json({ 'errormessage': 'this user already exists' });
      return;
    }

    const salt     = bcrypt.genSaltSync(bcryptSalt);
    const password = bcrypt.hashSync(userPassword, salt);

    const userPassworEncrypted = {username, password, firstname, lastname};
    console.log("User will be created:"+userPassworEncrypted);

    User
      .create(userPassworEncrypted)
      .then((user) => {
        res.status(200).json(user);
      })
      .catch(err => console.log(err));
  });
});



router.post("/login", (req, res) => {
  const username = req.body.username;
  const userPassword = req.body.password;
  User.findOne({ username }, "_id username password firstname lastname", (err, user) => {
    if (err || !user) {
      res.status(200).json({ errorMessage: "The username doesn't exist." });
    } else {
      if (bcrypt.compareSync(userPassword, user.password)) {
        req.session.currentUser = user;
        res.status(200).json(user);
      } else {
        res.status(200).json({ errorMessage: "Incorrect password." });
      }
    }
  });
});


router.get("/logout", (req, res, next) => {
  if (!req.session.currentUser) { 
    res.status(200).json({ errorMessage: "logged out" }); 
    return; 
  }
  req.session.destroy( err => {
    if (err) { 
      console.log(err); 
    } else { 
      res.status(200).json({ errorMessage: "logged out" }); 
    }
  });
});

module.exports = router;
