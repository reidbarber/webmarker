chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "injectWebMarker") {
    const { code } = message;
    chrome.scripting.executeScript(
      {
        target: { tabId: sender.tab.id },
        world: "MAIN",
        func: new Function(code),
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else {
          sendResponse({ success: true });
        }
      }
    );
    return true;
  }
});
