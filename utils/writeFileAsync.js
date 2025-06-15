const path = require("path");
const fs = require("fs");

async function writeFileAsync(filepath, content) {
  fs.writeFile(
    path.join(__dirname, filepath),
    JSON.stringify(content, null, 2), // Convert object to JSON string
    "utf-8",
    (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        throw err;
      }
    }
  );
}

module.exports = writeFileAsync;
