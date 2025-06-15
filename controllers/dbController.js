const fs = require("fs");
const path = require("path");

const DBStorage = require("./../utils/DBStorage");
const CustomError = require("./../utils/CustomError.js");
const objectIdFile = require("./../database/ObjectId.json");

const crypto = require("./../utils/Crypto.js");
const writeFileAsync = require("../utils/writeFileAsync.js");
const JWT = require("./../utils/JWT.js");

const db = new DBStorage();
const jwt = new JWT();

const createUser = async (req, res, next) => {
  try {
    console.log("Create User");
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError({
        status: "fail",
        statusCode: 400,
        message: "Email or password missing",
      });
    }

    let userId;
    while (true) {
      userId = await crypto.generateUUID();
      if (!objectIdFile[userId]) break;
    }

    const token = jwt.sign({ email, createdAt: Date.now(), userId });

    //create database
    fs.mkdirSync(path.join(__dirname, "./../database", userId), (err) => {
      if (err) throw err;
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
  } catch (error) {
    next(error);
  }
};

const createFolder = async (req, res, next) => {
  try {
    const dirName = req.body.dirName;
    if (!dirName) {
      throw new Error({
        statusCode: 400,
        status: "fail",
        message: "Folder Name Missing!",
      });
    }

    await db.createFolder(dirName);
    console.log("Created New Folder");
    res.status(200).json({
      status: "success",
      message: `Created new folder / DirPath: ${dirName}`,
    });
  } catch (error) {
    next(error);
  }
};

const deleteFolder = async (req, res, next) => {
  try {
    const dirName = req.body.dirName;
    if (!dirName) {
      throw new Error({
        statusCode: 400,
        status: "fail",
        message: "Folder Name Missing!",
      });
    }

    await db.deleteFolder(dirName);
    console.log("Created New Folder");
    res.status(200).json({
      status: "success",
      message: `deleted folder / DirPath: ${dirName}`,
    });
  } catch (error) {
    next(error);
  }
};

const upload = async (req, res, next) => {
  try {
    if (req.body["chunkSize"]) {
      const fileSize = req.body.contentLength;
      const receivedChunks = req.body.deliveredChunks;
      const percent = ((receivedChunks / fileSize) * 100).toFixed(2);

      if (Number(percent) === 100) {
        const uploadId = req.body.uploadId;
        const filename = req.body.originalName;
        const outputPath = req.body.outputPath;
        const dirName = req.body.dirName;

        await db.createFileWithChunkFiles(
          uploadId,
          outputPath,
          dirName,
          filename
        );
      }

      res.status(200).json({
        status: Number(percent) === 100 ? "success" : "pending",
        message:
          Number(percent) === 100
            ? "File uploaded successfully"
            : "Uploading...",
        data: {
          fileName: req.file.originalName, // Return the name of the uploaded file
          percent,
        },
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "File uploaded successfully",
        fileName: req.file.originalName,
      });
    }
  } catch (error) {
    console.error("Upload error:", error); // Log the error for debugging
    next(error);
  }
};

const download = async (req, res, next) => {
  try {
    const { filePath } = req.body;
    console.log(filePath);

    res.status(200).json({
      status: "success",
      message: `download route`,
    });
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const { filePath } = req.body;
    console.log(filePath);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFolder,
  deleteFolder,
  upload,
  download,
  deleteFile,
  createUser,
};
