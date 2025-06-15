const path = require("path");
const fs = require("fs");
const CustomError = require("./CustomError.js");
const JWT = require("./JWT.js");
const crypto = require("./Crypto.js");

const jwt = new JWT();

class ObjectId {
  constructor() {
    this.userId = process.env.DB_USERID;
    this.__filePath = path.join(__dirname, "./../database/ObjectId.json");
    this.__objectIdFile = require(this.__filePath);
    this.init();
  }

  init() {
    //check userId
    if (!this.__objectIdFile[this.userId]) {
      throw new CustomError({
        status: "Unauthorized",
        statusCode: 401,
        message: "Invalid UserID",
      });
    }
  }

  getObjectIdData() {
    return this.__objectIdFile[this.userId];
  }

  isDirectory() {}

  dirnameExists(dirnameToCheck) {
    const tokens = Object.values(this.__objectIdFile[this.userId]);
    if (tokens.length <= 0) return false;
    for (const token of tokens) {
      //dirname / userId
      const { dirname } = jwt.verify(token);
      if (dirname && dirnameToCheck === dirname) return true;
    }
    return false;
  }

  getFinalDestinationWithObjectId(dirname) {
    const routes = dirname
      .trim()
      .split("/")
      .filter((item) => item !== ".");
    const length = routes.length;

    let copyRoutes = routes;
    const result = [];
    for (let i = 0; i < length - 1; i++) {
      copyRoutes.pop();

      const route = `./${copyRoutes.join("/")}`;
      result.push(this.getObjectIdByDirname(route));
    }
    if (result.length === 0) return "./";
    const finalDestinationWithObjectId = `./${result.join("/")}`;
    return finalDestinationWithObjectId;
  }

  accessToAdd(dirnameToCreate) {
    const routes = dirnameToCreate
      .trim()
      .split("/")
      .filter((item) => item !== ".");
    const length = routes.length;

    let copyRoutes = routes;
    for (let i = 0; i < length - 1; i++) {
      copyRoutes.pop();

      const route = `./${copyRoutes.join("/")}`;
      if (!this.dirnameExists(route)) return false;
    }
    return true;
  }

  __fileNameExists(dirPath, fileName) {
    const tokens = Object.values(this.__objectIdFile[this.userId]);

    for (const token of tokens) {
      const decodedToken = jwt.verify(token);
      const { filename: fileNameFromToken, dirPath: dirPathFromToken } =
        decodedToken;
      console.log(fileNameFromToken, dirPathFromToken, "from Objectid");
      if (
        fileNameFromToken &&
        fileNameFromToken === fileName &&
        dirPathFromToken === dirPath
      )
        return true;
    }
    return false;
  }

  async getSafeFilename(dirPath, fileName) {
    const filePath = path.join(dirPath, fileName);
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    let counter = 1;
    let newFileName = fileName;
    // Check if the file already exists and create a new filename if necessary
    while (this.__fileNameExists(dirPath, newFileName)) {
      newFileName = `${baseName} (${counter})${ext}`;
      counter++;
    }
    return newFileName;
  }

  getObjectIdByDirname(dirnameToFind) {
    const tokens = Object.values(this.__objectIdFile[this.userId]);

    let tokenToFind;
    for (const token of tokens) {
      //dirname / userId
      const { dirname } = jwt.verify(token);
      if (dirname && dirnameToFind === dirname) {
        tokenToFind = token;
      }
    }
    if (!tokenToFind)
      throw new CustomError({
        status: "fail",
        statusCode: 409,
        message: "We can't found objectId with this dirname",
      });

    const objectId = Object.entries(this.__objectIdFile[this.userId])
      .filter(([_, value]) => value === tokenToFind)
      .map(([key]) => key);

    return objectId[0];
  }

  __writeFileSync() {
    fs.writeFileSync(
      this.__filePath,
      JSON.stringify(this.__objectIdFile, null, 2), // Convert object to JSON string
      "utf-8",
      (err) => {
        if (err) {
          console.error("Error writing to file:", err);
          throw err;
        }
      }
    );
  }

  async generateUniqueObjectId() {
    //generate uuid
    let uuid;
    while (true) {
      uuid = await crypto.generateUUID();
      if (!this.exists(uuid)) break;
    }
    return uuid;
  }

  exists(objectId) {
    return JSON.stringify(this.__objectIdFile[this.userId]).includes(objectId);
  }

  async addObjectId(objectId, payload) {
    try {
      if (!objectId) throw new Error("invalid uuid");
      const token = jwt.sign(payload);
      console.log(objectId, "ObjectId");
      this.__objectIdFile[this.userId][objectId] = token;
      this.__writeFileSync();
    } catch (error) {
      throw error;
    }
  }

  async removeObjectId(objectId) {
    try {
      delete this.__objectIdFile[this.userId][objectId];
      this.__writeFileSync();
    } catch (error) {
      throw error;
    }
  }
}
module.exports = ObjectId;
