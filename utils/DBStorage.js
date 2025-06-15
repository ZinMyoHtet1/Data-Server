const fs = require("fs");
const path = require("path");

const ObjectId = require("./ObjectId.js");
const CustomError = require("./CustomError.js");
const { error } = require("console");
const objectId = new ObjectId();

class DBStorage {
  constructor() {
    this.__rootPath = path.join(__dirname, "./../database");
    this.isConnected = null;
    this.init(process.env.DB_USERID);
  }

  async createFolder(dirPath) {
    try {
      //Check if folder exist
      if (objectId.dirnameExists(dirPath)) {
        throw new CustomError({
          status: "fail",
          statusCode: 409,
          message: "This folder has already existed",
        });
      }

      if (!objectId.accessToAdd(dirPath)) {
        throw new CustomError({
          status: "fail",
          statusCode: 400,
          message: "Invalid directory",
        });
      }

      //generate unique objectId
      const uuid = await objectId.generateUniqueObjectId();
      const finalDestinationPath =
        objectId.getFinalDestinationWithObjectId(dirPath);
      const folderPath = path.join(this.__dbPath, finalDestinationPath, uuid);
      fs.mkdirSync(folderPath);

      const payload = {
        dirname: dirPath,
        createdAt: Date.now(),
        userId: process.env.DB_USERID,
      };
      await objectId.addObjectId(uuid, payload);
    } catch (err) {
      console.log(err.message);
      throw err;
    }
  }

  async deleteFolder(dirPath) {
    try {
      if (!objectId.dirnameExists(dirPath)) {
        throw new CustomError({
          status: "fail",
          statusCode: 400,
          message: "This folder don't exist",
        });
      }
      const uuid = objectId.getObjectIdByDirname(dirPath);

      const finalDestinationPath =
        objectId.getFinalDestinationWithObjectId(dirPath);

      fs.rmdirSync(path.join(this.__dbPath, finalDestinationPath, uuid));
      await objectId.removeObjectId(uuid);
    } catch (err) {
      console.log(err.message);
      throw err;
    }
  }

  async upload(file) {
    try {
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }

  // Function to create a safe filename
  __getSafeFilePath(filePath) {
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    let counter = 1;
    let newFilePath = filePath;
    // Check if the file already exists and create a new filename if necessary
    while (fs.existsSync(newFilePath)) {
      newFilePath = path.join(
        path.dirname(filePath),
        `${baseName} (${counter})${ext}`
      );
      counter++;
    }
    return newFilePath;
  }

  createFileWithChunkFiles = async (
    uploadId,
    outputPath,
    dirName,
    filename
  ) => {
    try {
      // Check if the directory exists
      const chunksPath = path.join(this.__tempChunksPath, uploadId);
      if (!fs.existsSync(chunksPath)) {
        return res.status(404).json({
          status: "error",
          message: "Upload directory not found.",
        });
      }

      //check if destination is valid
      const files = fs.readdirSync(chunksPath, "utf8");
      const chunks = [];

      // Read each chunk file
      for (const filename of files) {
        const chunkPath = path.join(chunksPath, filename);
        const chunk = fs.readFileSync(chunkPath); // Read the chunk synchronously
        chunks.push(chunk);
      }

      //generate unique objectId
      const uuid = await objectId.generateUniqueObjectId();
      const finalFilePath = path.join(outputPath, uuid);

      const safeFileName = await objectId.getSafeFilename(dirName, filename);

      // Assemble the file from chunks
      fs.writeFileSync(finalFilePath, Buffer.concat(chunks)); // Concatenate and write to a new file
      const payload = {
        filename: safeFileName,
        dirPath: dirName,
        ext: path.extname(filename),
        createdAt: Date.now(),
        userId: process.env.DB_USERID,
      };

      console.log("Payload From DBStorage:", payload);

      await objectId.addObjectId(uuid, payload);
      // Optionally, clean up the chunk files
      files.forEach((filename) => {
        fs.unlinkSync(path.join(chunksPath, filename)); // Delete each chunk file
      });

      if (fs.existsSync(chunksPath)) {
        fs.rmdirSync(chunksPath);
      }

      console.log("Complete File Created from Chunks");
    } catch (error) {
      console.log(error.message, "from create file with chunk files");
      throw error;
    }
  };

  getDbPath() {
    return this.__dbPath;
  }

  getTempChunksPath() {
    if (!fs.existsSync(this.__tempChunksPath)) {
      fs.mkdirSync(this.__tempChunksPath);
    }
    return this.__tempChunksPath;
  }

  init(userId) {
    const dbPath = path.join(this.__rootPath, userId);
    if (!fs.existsSync(dbPath)) {
      throw new CustomError({
        status: "fail",
        statusCode: 401,
        message: "Unauthorized : userId is not valid",
      });
    }
    this.__dbPath = dbPath;
    this.__dbName = userId;
    this.__tempChunksPath = path.join(this.__dbPath, "tempChunks");
  }
}

module.exports = DBStorage;
