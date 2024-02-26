//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption");
const mongoose = require("mongoose");

const app = express();
mongoose.connect("mongodb://localhost:27017/userDB");

// creating schema for user
const userSechema = new mongoose.Schema({
  email: String,
  password: String,
});
const secret = "Thisisasecret";
userSechema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });
const User = new mongoose.model("User", userSechema);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({ email: username })
    .then((user) => {
      if (user) {
        if (user.password == password) {
          res.render("secrets");
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  const user = new User({
    email: req.body.username,
    password: req.body.password,
  });
  user
    .save()
    .then(() => {
      res.render("secrets");
    })
    .catch((err) => {
      console.log(err);
    });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
