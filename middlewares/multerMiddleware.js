const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Database = require("./../utils/DBStorage.js");
const ObjectId = require("./../utils/ObjectId.js");
const CustomError = require("./../utils/CustomError.js");

const database = new Database();
const objectId = new ObjectId();

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dirName = req.body.dirName;
    if (!objectId.dirnameExists(dirName) && dirName !== "./") {
      throw new CustomError({
        status: "fail",
        statusCode: 400,
        message: "This directory not existed",
      });
    }

    let outputPath = path.join(
      database.getDbPath(),
      dirName === "./" ? "" : objectId.getObjectIdByDirname(dirName)
    );

    req.body.outputPath = outputPath;
    if (req.body["chunkSize"]) {
      outputPath = path.join(database.getTempChunksPath(), req.body.uploadId);
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
      }
    }

    cb(null, outputPath); // Specify the uploads directory
  },

  filename: async (req, file, cb) => {
    let outputName = Date.now() + path.extname(file.originalname) + ".txt";
    if (!req.body["chunkSize"]) {
      //add objectId
      const uuid = await objectId.generateUniqueObjectId();
      const safeFileName = await objectId.getSafeFilename(
        req.body.dirName,
        req.body.fileName
      );
      outputName = uuid;

      const payload = {
        filename: safeFileName,
        dirPath: req.body.dirName,
        ext: path.extname(safeFileName),
        createdAt: Date.now(),
        userId: process.env.DB_USERID,
      };

      await objectId.addObjectId(uuid, payload);
    }
    cb(null, outputName);
  },
});
// Initialize multer with the storage configuration
const upload = multer({ storage });

const uploadSingleFile = upload.single("file");

module.exports = uploadSingleFile;
