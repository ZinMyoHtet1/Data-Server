async function fetchUrlAndStreamWithRange(url, req, res) {
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

module.exports = fetchUrlAndStreamWithRange;
