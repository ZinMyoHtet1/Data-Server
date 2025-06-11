const form = document.getElementById("readForm");
const urlInput = document.getElementById("urlInput");
const fileName = document.getElementById("fileName");
const loadingText = document.getElementById("loadingText");
const errorMessage = document.getElementById("errorMessage");
const submitBtn = document.getElementById("submitBtn");
const videoCard = document.getElementsByClassName("videoCard");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  handleUpload(urlInput.value, fileName.value);
});
async function handleSubmit(e) {
  event.preventDefault();
  errorMessage.hidden = true;
  loadingText.hidden = false;
  submitBtn.disabled = true;

  // const filename = urlInput.value.trim();
  try {
    const response = await fetch(
      `http://localhost:5000/read?filename=${e.target.innerText}`
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    const reader = response.body.getReader();
    const chunks = [];
    let receivedLength = 0;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
    }

    const videoBuffer = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      videoBuffer.set(chunk, position);
      position += chunk.length;
    }

    const blob = new Blob([videoBuffer], { type: contentType });
    const videoBlobURL = URL.createObjectURL(blob);
    videoPlayer.src = videoBlobURL;
    loadingText.hidden = true;

    // Reset video playback state
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
  } catch (err) {
    loadingText.hidden = true;
    errorMessage.textContent = err.message;
    errorMessage.hidden = false;
  } finally {
    submitBtn.disabled = false;
    if (!errorMessage.hidden) {
      errorMessage.focus();
    }
  }
}
