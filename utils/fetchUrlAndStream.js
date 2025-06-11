const fs = require("fs"); // Use promises API for fs
const path = require("path");
// const events = require("events");

// const emitter = new events.EventEmitter();
async function fetchUrlAndStream(url, res, callback) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Network Error: \/${response.status} \/${response.statusText}`
      );
    }

    // const contentLength = response.headers.get("content-length");
    // const totalLength = contentLength ? parseInt(contentLength, 10) : null;
    // let receivedLength = 0;
    // let lastPercent = 0;

    const reader = response.body.getReader();
    const contentLength = response.headers.get("Content-Length");
    // const chunks = [];

    // console.log("downloading....");
    res.setHeader("Content-Length", contentLength);
    while (true) {
      const { value } = await reader.read();
      if (value) {
        callback(Buffer.from(value));
      } else {
        callback(undefined);
        break;
      }

      //   chunks.push(value);
      //   receivedLength += value.length;

      //   if (totalLength) {
      //     const percent = ((receivedLength / totalLength) * 100).toFixed(2);
      //     if (percent - lastPercent >= 1) {
      //       lastPercent = percent;
      //       callback(percent);
      //     }
      //   }
    }

    // const result = Buffer.concat(chunks); // Use Buffer.concat to combine chunks

    // fs.writeFile(outputPath, result, (error) => {
    //   if (!error) callback(100);
    // });
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
}

module.exports = fetchUrlAndStream;
