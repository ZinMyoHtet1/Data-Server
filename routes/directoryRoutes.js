const express = require("express");
const directoryController = require("./../controllers/directoryController.js");
const uploadSingleFile = require("./../middlewares/multerMiddleware.js");

const route = express.Router();

route.get("/", directoryController.getDirectoriesFromRoot);
route.post("/createFolder", directoryController.createFolder);
route.post("/deleteFolder", directoryController.deleteFolder);
// route.post("/createUser", directoryController.createUser);
route.post("/upload", uploadSingleFile, directoryController.upload); // Change to upload.fields()
route.post("/download", directoryController.download);
route.post("/deleteFile", directoryController.deleteFile);
route.get("/:dirnameId", directoryController.getDirectoriesWithDirId);

module.exports = route;
