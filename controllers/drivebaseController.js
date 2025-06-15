// const path = require("path");
const fetchStreamAndDownload = require("./../utils/fetchStreamAndDownload.js");
const readFileStream = require("./../utils/readFileStream.js");
const fetchUrlAndStream = require("./../utils/fetchUrlAndStream.js");
const fetchUrlAndStreamWithRange = require("./../utils/fetchUrlAndStreamWithRange.js");
const DriveBase = require("./../utils/DriveBase.js");

const drivebase = new DriveBase("myDB");

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

    await drivebase.createFolder(dirName);
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

    await drivebase.deleteFolder(dirName);
    console.log("Created New Folder");
    res.status(200).json({
      status: "success",
      message: `deleted folder / DirPath: ${dirName}`,
    });
  } catch (error) {
    next(error);
  }
};

const getAllVideos = async (req, res, next) => {
  console.log("get videos");
  try {
    // const filenames = fs.readdirSync(__dirname + "./../database/myDB/storage", {
    //   encoding: "utf8",
    // });

    const filenames = await driveBase.getAll();

    res.status(200).json({
      status: "success",
      data: filenames,
    });
  } catch (error) {
    next(error);
  }
};

const readVideo = async (req, res, next) => {
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
};

const uploadVideo = async (req, res, next) => {
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
};

const downloadVideo = async (req, res, next) => {
  try {
    const url = req.query.url;

    if (!url) {
      const error = new Error("Url missing");
      error.statusCode = 400;
      return next(error); // Use return to exit the handler
    }
    // await fetchUrlAndStream(url, res, range);

    await fetchUrlAndStream(url, res, (value) => {
      if (value) {
        console.log("runiii");
        res.write(value);
      } else {
        console.log("End");
        res.end();
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const watchStreamVideo = async (req, res, next) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("Missing video URL.");
  }

  await fetchUrlAndStreamWithRange(url, req, res);
};

module.exports = {
  getAllVideos,
  readVideo,
  uploadVideo,
  downloadVideo,
  watchStreamVideo,
  createFolder,
  deleteFolder,
};
