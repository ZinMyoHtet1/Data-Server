const path = require("path");
const fs = require("fs");
const events = require("events");
const emitter = new events.EventEmitter();

async function readFileStream(filename) {
  const filePath = path.join(
    __dirname,
    "./../database/myDB/storage/",
    filename
  );
  const readStream = fs.createReadStream(filePath);
  readStream.on("data", (chunk) => {
    emitter.emit("data", chunk);
  });
  readStream.on("end", () => {
    emitter.emit("end", true);
  });
  readStream.on("error", (error) => {
    throw new Error(error.message);
  });
  return emitter;
}

module.exports = readFileStream;
