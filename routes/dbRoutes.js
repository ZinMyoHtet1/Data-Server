const express = require("express");
const dbController = require("../controllers/dbController.js");

const route = express.Router();

route.post("/createUser", dbController.createUser);

module.exports = route;
