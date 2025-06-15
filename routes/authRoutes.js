const express = require("express");
const authRoutes = require("../controllers/authController");

const route = express.Router();

route.post("/login", authRoutes.login);
route.post("/register", authRoutes.register);

module.exports = route;
