const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("ffprobe-static");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobe.path); // ✅ Add this line

const url =
  "https://drive.usercontent.google.com/u/0/uc?id=1cJRjAhtJHsVdI4a29ehYTodvq8dlXHvv";

async function getThumbnail(url, name) {
  return new Promise((resolve, reject) => {
    const folderName = path.join(
      __dirname,
      "./../database/myDB/storage/thumbnails"
    );
    const outputPath = path.join(folderName, `${name}-thumbnail.jpg`);

    ffmpeg(url)
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .screenshots({
        count: 1,
        folder: folderName,
        filename: `${name}-thumbnail.jpg`,
        size: "320x240",
      });
  });
}

// TESTING
(async () => {
  try {
    const thumbnail = await getThumbnail(url, "hydram-test");
    console.log(thumbnail, "Thumbnail");
  } catch (error) {
    console.log(error.message);
  }
})();

module.exports = getThumbnail;
