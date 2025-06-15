const path = require("path");
const fs = require("fs");
const objectIdFile = require("../database/ObjectId.json");

async function addObjectId(objectId, token) {
  try {
    const userId = "user1";
    objectIdFile[userId][objectId] = token;

    fs.writeFile(
      path.join(__dirname, "./../database/ObjectId.json"),
      JSON.stringify(objectIdFile, null, 2), // Convert object to JSON string
      "utf-8",
      (err) => {
        if (err) {
          console.error("Error writing to file:", err);
        } else {
          console.log("Data written to file successfully!");
        }
      }
    );
  } catch (error) {
    throw error;
  }
}

module.exports = addObjectId;
