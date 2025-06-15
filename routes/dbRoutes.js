const express = require("express");
const dbController = require("./../controllers/dbController.js");
const uploadSingleFile = require("./../middlewares/multerMiddleware.js");

const route = express.Router();

route.get("/", (req, res, next) => {
  console.log("hello from database");
  res.status(200).json({
    status: "hello",
  });
});

route.post("/createUser ", dbController.createUser);
route.post("/createFolder", dbController.createFolder);
route.post("/deleteFolder", dbController.deleteFolder);
route.post("/upload", uploadSingleFile, dbController.upload); // Change to upload.fields()
route.post("/download", dbController.download);
route.post("/deleteFile", dbController.deleteFile);

module.exports = route;
