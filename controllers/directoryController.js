const DBStorage = require("../utils/DBStorage.js");
const asyncErrorHandler = require("../utils/asyncErrorHandler.js");

const db = new DBStorage();

const getDirectoriesFromRoot = asyncErrorHandler(async (req, res, next) => {
  const results = await db.getDirectoriesFromRoot();
  res.status(200).json({
    status: "success",
    data: results,
  });
});

const getDirectoriesWithDirId = asyncErrorHandler(async (req, res, next) => {
  const dirnameId = req.params.dirnameId;

  const results = await db.getDirectoriesWithDirId(dirnameId);
  res.status(200).json({
    status: "success",
    data: results,
  });
});

const createFolder = asyncErrorHandler(async (req, res, next) => {
  const dirName = req.body.dirName;
  if (!dirName) {
    const error = new Error({
      statusCode: 400,
      status: "fail",
      message: "Folder Name Missing!",
    });

    next(error);
  }

  await db.createFolder(dirName);
  res.status(200).json({
    status: "success",
    message: `Created new folder / DirPath: ${dirName}`,
  });
});

const deleteFolder = asyncErrorHandler(async (req, res, next) => {
  const dirName = req.body.dirName;
  if (!dirName) {
    const error = new Error({
      statusCode: 400,
      status: "fail",
      message: "Folder Name Missing!",
    });
    next(error);
  }

  await db.deleteFolder(dirName);
  res.status(200).json({
    status: "success",
    message: `deleted folder / DirPath: ${dirName}`,
  });
});

const upload = asyncErrorHandler(async (req, res, next) => {
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
        Number(percent) === 100 ? "File uploaded successfully" : "Uploading...",
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
});

const download = asyncErrorHandler(async (req, res, next) => {
  const { filePath } = req.body;
  console.log(filePath);

  res.status(200).json({
    status: "success",
    message: `download route`,
  });
});

const deleteFile = asyncErrorHandler(async (req, res, next) => {
  const { filePath } = req.body;
  console.log(filePath);
  res.status(200).json({
    status: "success",
    message: "Delete file route",
  });
});

module.exports = {
  getDirectoriesWithDirId,
  getDirectoriesFromRoot,
  createFolder,
  deleteFolder,
  upload,
  download,
  deleteFile,
  // createUser,
};
