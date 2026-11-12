function getVideoId() {
  const url = window.location.href;

  // Standard watch URL
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    console.log("VidSense: Found video ID via watch URL:", watchMatch[1]);
    return watchMatch[1];
  }

  // Shorts URL
  const shortsMatch = url.match(/shorts\/([^?]+)/);
  if (shortsMatch) {
    console.log("VidSense: Found video ID via shorts URL:", shortsMatch[1]);
    return shortsMatch[1];
  }

  // youtu.be URL
  const shortUrlMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortUrlMatch) {
    console.log("VidSense: Found video ID via short URL:", shortUrlMatch[1]);
    return shortUrlMatch[1];
  }

  console.log("VidSense: Could not extract video ID from URL:", url);
  return null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_VIDEO_ID") {
    sendResponse({ videoId: getVideoId() });
  }
});
