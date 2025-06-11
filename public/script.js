const responseCard = document.getElementById("responseCard");
const videoPlayer = document.getElementById("videoPlayer");
const videoCardContainer = document.getElementById("videoCardContainer");

const leftOverlay = responseCard.querySelector(".video-overlay.left");
const rightOverlay = responseCard.querySelector(".video-overlay.right");

(async () => {
  // Helper to allow keyboard activation of overlays for accessibility

  // Double-click forward/backward 10s actions
  const { data } = await getVideos();
  if (data) {
    for (const fn of data) {
      const div = document.createElement("div");
      div.className = "videoCard";
      div.textContent = fn;
      div.onclick = handleSubmit;
      videoCardContainer.appendChild(div);
    }
  }
  leftOverlay.addEventListener("dblclick", () => {
    if (!videoPlayer.paused) {
      videoPlayer.currentTime = Math.max(videoPlayer.currentTime - 10, 0);
      flashOverlayFeedback(leftOverlay, "Rewind 10s");
    }
  });

  rightOverlay.addEventListener("dblclick", () => {
    if (!videoPlayer.paused) {
      videoPlayer.currentTime = Math.min(
        videoPlayer.currentTime + 10,
        videoPlayer.duration || Infinity
      );
      flashOverlayFeedback(rightOverlay, "Forward 10s");
    }
  });

  // Keyboard accessibility (Enter and Space) for overlays
  leftOverlay.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      leftOverlay.dispatchEvent(new Event("dblclick"));
    }
  });

  rightOverlay.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      rightOverlay.dispatchEvent(new Event("dblclick"));
    }
  });

  // Optional visual feedback on overlay double click
  function flashOverlayFeedback(element, text) {
    const tooltip = document.createElement("div");
    tooltip.textContent = text;
    tooltip.style.position = "absolute";
    tooltip.style.top = "50%";
    tooltip.style.left = "50%";
    tooltip.style.transform = "translate(-50%, -50%)";
    tooltip.style.background = "rgba(37, 99, 235, 0.85)";
    tooltip.style.color = "#fff";
    tooltip.style.padding = "6px 12px";
    tooltip.style.borderRadius = "8px";
    tooltip.style.fontWeight = "700";
    tooltip.style.pointerEvents = "none";
    tooltip.style.userSelect = "none";
    tooltip.style.zIndex = "50";
    element.appendChild(tooltip);

    setTimeout(() => {
      tooltip.remove();
    }, 1000);
  }
})();
