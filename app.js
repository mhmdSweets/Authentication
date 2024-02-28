//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// creating express app
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// session
// app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);
// passport
app.use(passport.initialize());
app.use(passport.session());

// connect to mongodb
mongoose.connect("mongodb://localhost:27017/userDB");
// creating schema for user
const userSechema = new mongoose.Schema({
  email: String,
  password: String,
});

// using passport-local-mongoose
userSechema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSechema);
// passport config
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Gets
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
//
app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/");
  }
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      // Handle logout errors (optional)
      console.error(err);
      res.status(500).send("Error during logout"); // Example error response
    } else {
      res.redirect("/");
    }
  });
});

// Posts
app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });
});
//
app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    }
  );
});

//
// Server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
