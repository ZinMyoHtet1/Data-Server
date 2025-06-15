const fs = require("fs");
const events = require("events");
const path = require("path");
const emitter = new events.EventEmitter();

class DriveBase {
  constructor(dbName) {
    // this.folder = path.join(__dirname, folder);
    this.drivebasePath = path.join(__dirname, "./../drivebase");
    this.init(dbName);
  }

  async createDB(dbName) {
    try {
      // If db is absolute path use it as is, else join with __dirname
      const dbPath = path.join(this.drivebasePath, dbName);

      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true }); // Create the db if it doesn't exist
        console.log("Created new DriveBase at", dbPath);
      }
      this.dbPath = dbPath;
      return this;
    } catch (error) {
      console.error("Error connecting to DriveBase:", error.message);
      throw error;
    }
  }

  async init(db) {
    try {
      await this.createDB(db); // Wait for createDB to complete
    } catch (error) {
      console.error("Error initializing DriveBase:", error.message);
    }
  }

  async createFolder(dirPath) {
    try {
      //Check if folder exist
      const folderPath = path.join(this.dbPath, dirPath);

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, (err) => {
          if (err) throw err;
        });
      } else {
        throw new Error({
          status: 409,
          message: "This dir has Already Existed",
        });
      }
    } catch (err) {
      console.log(err.message);
      throw err;
    }
  }

  async deleteFolder(dirPath) {
    const folderPath = path.join(this.dbPath, dirPath);

    try {
      if (fs.existsSync(folderPath)) {
        fs.rmdirSync(folderPath);
      } else {
        throw new Error({
          status: 409,
          message: "This dir is not existed",
        });
      }
    } catch (error) {
      throw err;
    }
  }

  async getAllFile(path) {
    try {
      const filenames = fs.readdir(path.join(this.folder, path), {
        encoding: "utf8",
      });
      return filenames;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }

  async upload(options, callback) {
    try {
      const { url, filename, path, fileType } = options;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Network Error: \/${response.status} \/${response.statusText}`
        );
      }

      // const outputPath = path.join(__dirname, folder, filename + ".mp4");
      const outputPath = path.join(
        this.folder,
        path,
        `/${filename}.${fileType}`
      );

      fs.exists(outputPath, (exists) => {
        if (exists) {
          throw new Error("This video name has already existed");
        }
      });

      const contentLength = response.headers.get("content-length");
      const totalLength = contentLength ? parseInt(contentLength, 10) : null;
      let receivedLength = 0;
      let lastPercent = 0;

      const reader = response.body.getReader();
      const chunks = [];

      // console.log("downloading....");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (totalLength) {
          const percent = ((receivedLength / totalLength) * 100).toFixed(2);
          if (percent - lastPercent >= 1) {
            lastPercent = percent;
            callback(percent);
          }
        }
      }

      const result = Buffer.concat(chunks); // Use Buffer.concat to combine chunks

      fs.writeFile(outputPath, result, (error) => {
        if (!error) callback(100);
      });
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async download(filePath) {
    const targetPath = `${this.dbPath}/${filePath}`;
    const readStream = fs.createReadStream(targetPath);
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

  async watch(url, req, res) {
    try {
      const range = req.headers.range;

      res.setHeader("Content-Type", "video/mp4");

      if (!range) {
        // If no range, return full file (not ideal for large videos)
        const response = await fetch(url);

        const reader = response.body.getReader();

        const contentLength = response.headers.get("content-length");
        res.setHeader("Content-Length", contentLength);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          res.write(Buffer.from(value));
        }
        res.end();
      }

      // Get video file size from a HEAD request
      const headResp = await fetch(url, { method: "HEAD" });
      const fileSize = parseInt(headResp.headers.get("content-length"));
      let receivedLength = 0;

      const CHUNK_SIZE = 10 ** 6; // 1MB chunks
      const start = Number(range.replace(/\D/g, ""));
      const end = Math.min(start + CHUNK_SIZE - 1, fileSize - 1);
      const contentLength = end - start + 1;

      const headers = {
        Range: `bytes=${start}-${end}`,
      };

      const response = await fetch(url, { headers });
      const reader = response.body.getReader();

      res.setHeader("Content-Length", contentLength);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Content-Ranges", "bytes");
      res.status(206);

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        if (receivedLength + value.length > fileSize) {
          const remaining = fileSize - receivedLength;
          res.write(Buffer.from(value.slice(0, remaining)));
        } else {
          res.write(Buffer.from(value));
        }
      }
      res.end();
    } catch (err) {
      res.status(500).end("Video streaming failed.");
      throw err;
    }
  }
}

module.exports = DriveBase;
