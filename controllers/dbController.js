const path = require("path");
const fs = require("fs");

const asyncErrorHandler = require("../utils/asyncErrorHandler.js");
const crypto = require("../utils/Crypto.js");
const CustomError = require("../utils/CustomError.js");
const JWT = require("./../utils/JWT.js");
const writeFileAsync = require("../utils/writeFileAsync.js");

const jwt = new JWT();

const createUser = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new CustomError({
      status: "fail",
      statusCode: 400,
      message: "Email or password missing",
    });
    next(error);
  }

  let userId;
  while (true) {
    userId = await crypto.generateUUID();
    if (!objectIdFile[userId]) break;
  }

  const token = jwt.sign({ email, createdAt: Date.now(), userId });

  //create database
  fs.mkdirSync(path.join(__dirname, "./../database", userId), (err) => {
    if (err) next(err);
  });

  //add userId to objecid
  objectIdFile[userId] = {};
  await writeFileAsync(`./../database/ObjectId.json`, objectIdFile);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    data: {
      token,
    },
    message: "Created New User",
  });
});

module.exports = { createUser };
