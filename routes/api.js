var express = require("express");
var router = express.Router();
const users = require("../data/users");
const fs = require("fs");
const path = require("path");
const { json } = require("express");
const { body, validationResult } = require('express-validator')
const writeData = require('../utils')

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.json({"message":"respond with a resource"});
});

router.get("/register", function (req, res, next) {
  //res.send('respond with a resource to add');
  res.render("register", { title: "Add User" });
});

router.post("/register", body('name').isLength({ min: 3 }),(req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  writeData(req)
  res.json(users)
});

router.get("/login", (req, res) => {
  res.render("login", { title: "Login Page" });
});

router.post("/login", (req, res) => {
  if (!users.find((user) => req.body.name === user.id)) {
    return res.render("users", { title: "User not found", users });
  }
  res.render("users", { title: "User added", users });
});

module.exports = router;
