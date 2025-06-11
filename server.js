const express = require("express");
const cors = require("cors");
const fs = require("fs");
const fetchStreamAndDownload = require("./utils/fetchStreamAndDownload.js");
const readFileStream = require("./utils/readFileStream.js");
const fetchUrlAndStream = require("./utils/fetchUrlAndStream.js");

// const database = require("./utils/Database.js");

const app = express();
// const myDB = database("myDB", (err) => {
//   if (err) console.log("Failed creating database");
//   console.log("Users DB created!");
// });

// const userSchema = myDB.Schema({
//   username: String,
//   email: String,
// });

// const User = myDB.createCollection("users", userSchema);

// console.log(User);
app.use(cors());
app.use(express.json());

app.get("/", async (req, res, next) => {
  console.log("get videos");
  try {
    const filenames = fs.readdirSync(__dirname + "/database/myDB/storage", {
      encoding: "utf8",
    });

    res.status(200).json({
      status: "success",
      data: filenames,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/read", async (req, res, next) => {
  try {
    const filename = req.query.filename;
    if (!filename) {
      const error = new Error("Url missing");
      error.statusCode = 400;
      next(error);
    }
    res.setHeader("Content-Type", "video/mp4");
    const result = await readFileStream(filename);
    // console.log(result, "\n");
    result.on("data", (chunk) => {
      res.write(chunk);
    });
    result.on("end", () => {
      res.end();
    });
  } catch (error) {
    next(error);
  }
});

app.get("/download", async (req, res, next) => {
  try {
    const url = req.query.url;
    const filename = req.query.filename;

    if (!url) {
      const error = new Error("Url missing");
      error.statusCode = 400;
      return next(error); // Use return to exit the handler
    }

    // Set headers *before* starting the download
    res.setHeader("Content-Type", "application/json"); // Correct Content-Type

    await fetchStreamAndDownload(url, filename, (percent) => {
      // This callback updates the progress
      console.log(`Download progress: ${percent}%`);
      // Serialize the object to JSON
      const progressUpdate = JSON.stringify({
        status: "pending",
        data: {
          percent,
        },
      });
      res.write(progressUpdate + "[split]"); // Send the JSON string
    })
      .then(() => {
        // Download completed successfully
        const successResponse = JSON.stringify({
          status: "success",
          message: "Download completed successfully",
          data: {
            filename,
            url,
          },
        });
        res.end(successResponse + "[split]"); // Send the final JSON response and end the connection
      })
      .catch((error) => {
        // Handle errors during download
        console.error("Download failed:", error);
        next(error); // Pass the error to the error handler
      });
  } catch (error) {
    console.error("Route error:", error);
    next(error); // Pass the error to the error handler
  }
});

app.get("/stream", async (req, res, next) => {
  try {
    const url = req.query.url;
    if (!url) {
      const error = new Error("Url missing");
      error.statusCode = 400;
      return next(error); // Use return to exit the handler
    }
    res.setHeader("Content-Type", "video/mp4");
    await fetchUrlAndStream(url, (value) => {
      if (value) {
        res.write(value);
      } else {
        // const numberArray = value.split(",").map(Number);
        // const restoredUint8Array = new Uint8Array(numberArray);
        console.log("complete!");
        res.end();
      }
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const status =
    error.statusCode >= 400 && error.statusCode < 500 ? "fail" : "error";
  res.status(statusCode).json({
    status: status,
    message: error.message,
  });
});

app.listen("5000", () => {
  console.log("Server is running on port 5000");
});
