async function fetchUrlAndStream(url, res, callback) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Network Error: ${response.status} ${response.statusText}`
      );
    }

    const contentLength = response.headers.get("Content-Length");
    res.setHeader("Content-Type", "video/mp4");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        callback(undefined);
        break;
      }
      callback(Buffer.from(value));
    }
  } catch (error) {
    console.error("Fetch Stream Error:", error.message);
    res.status(500).end("Failed to stream video.");
  }
}

module.exports = fetchUrlAndStream;
