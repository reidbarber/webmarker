chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, options } = message;

  if (action === "injectWebMarker") {
    sendResponse({ success: true });
    return;
  }

  const executeAction = () => {
    if (action === "markPage") {
      const markedElements = WebMarker.mark(options);
      sendResponse({ markedElements });
    } else if (action === "unmarkPage") {
      WebMarker.unmark();
      sendResponse({ success: true });
    } else if (action === "refresh") {
      if (WebMarker.isMarked()) {
        WebMarker.unmark();
      }
      const markedElements = WebMarker.mark(options);
      sendResponse({ markedElements });
    }
  };

  if (WebMarker && WebMarker.mark) {
    executeAction();
  } else {
    // Wait for WebMarker to load
    const interval = setInterval(() => {
      if (WebMarker && WebMarker.mark) {
        clearInterval(interval);
        executeAction();
      }
    }, 50);
  }

  return true;
});
