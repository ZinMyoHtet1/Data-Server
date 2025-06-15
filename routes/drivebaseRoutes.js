const express = require("express");
const drivebaseController = require("./../controllers/drivebaseController.js");
const route = express.Router();

route.get("/", drivebaseController.getAllVideos);
route.post("/createFolder", drivebaseController.createFolder);
route.post("/deletFolder", drivebaseController.deleteFolder);
route.get("/read", drivebaseController.readVideo);
route.get("/download", drivebaseController.downloadVideo);
route.get("/upload", drivebaseController.uploadVideo);
route.get("/watch", drivebaseController.watchStreamVideo);

module.exports = route;
