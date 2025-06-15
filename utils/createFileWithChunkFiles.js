const fs = require("fs");
const path = require("path");

// Function to create a safe filename
function getSafeFilePath(filePath) {
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  let counter = 1;
  let newFilePath = filePath;
  // Check if the file already exists and create a new filename if necessary
  while (fs.existsSync(newFilePath)) {
    newFilePath = path.join(
      path.dirname(filePath),
      `${baseName} (${counter})${ext}`
    );
    counter++;
  }
  return newFilePath;
}

const createFileWithChunkFiles = async (chunksPath, destination) => {
  try {
    // Check if the directory exists
    if (!fs.existsSync(chunksPath)) {
      return res.status(404).json({
        status: "error",
        message: "Upload directory not found.",
      });
    }

    const files = fs.readdirSync(chunksPath, "utf8");
    const chunks = [];

    // Read each chunk file
    for (const filename of files) {
      const chunkPath = path.join(chunksPath, filename);
      const chunk = fs.readFileSync(chunkPath); // Read the chunk synchronously
      chunks.push(chunk);
    }

    const safeFilePath = getSafeFilePath(destination);

    // Assemble the file from chunks
    fs.writeFileSync(safeFilePath, Buffer.concat(chunks)); // Concatenate and write to a new file

    // Optionally, clean up the chunk files
    files.forEach((filename) => {
      fs.unlinkSync(path.join(chunksPath, filename)); // Delete each chunk file
    });

    console.log("Complete File Created from Chunks");
  } catch (error) {
    console.log(error.message, "from create file with chunk files");
    throw error;
  }
};

module.exports = createFileWithChunkFiles;
