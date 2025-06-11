// const submitBtn = document.getElementById("submitBtn");
// const uploadMessage = document.getElementsByClassName("uploadMessage");
const uploadMessage = document.getElementById("uploadMessage");

async function handleUpload(url, filename) {
  submitBtn.disabled = true;
  uploadMessage.textContent = "";
  try {
    const response = await fetch(
      `http://localhost:5000/download?url=${url}}&filename=${filename}`
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunkArray = decoder.decode(value).split("[split]");
      chunkArray.pop();
      // const chunk = chunkArray;
      for (const chunk of chunkArray) {
        const result = JSON.parse(chunk);
        if (result.status === "pending") {
          submitBtn.textContent = "Uploading...";
          uploadMessage.textContent = `${result.data.percent}%`;
        }
        if (result.status === "success") {
          submitBtn.textContent = "Upload Video";
          uploadMessage.textContent = `Complete!`;
        }
      }
      // const result = JSON.parse(chunk);
      // const percent = chunkArray[chunkArray.length - 1];
      // uploadMessage.textContent = `${result.data.percent}%`;
    }
    submitBtn.disabled = false;
  } catch (error) {
    console.log(error.message);
  }
}
