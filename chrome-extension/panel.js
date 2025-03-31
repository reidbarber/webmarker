document.addEventListener("DOMContentLoaded", () => {
  const markPageCheckbox = document.getElementById("markPage");
  const selectorInput = document.getElementById("selector");
  const markPlacementSelect = document.getElementById("markPlacement");
  const showBoundingBoxesCheckbox =
    document.getElementById("showBoundingBoxes");
  const viewPortOnlyCheckbox = document.getElementById("viewPortOnly");
  const copyOptionsButton = document.getElementById("copyOptions");
  const refreshButton = document.getElementById("refresh");
  const outputDiv = document.getElementById("output");

  const getCurrentOptions = () => {
    return {
      selector: selectorInput.value,
      markPlacement: markPlacementSelect.value,
      showBoundingBoxes: showBoundingBoxesCheckbox.checked,
      viewPortOnly: viewPortOnlyCheckbox.checked,
      // TODO: Add new options
    };
  };

  const sendMessageToContentScript = (action) => {
    const options = getCurrentOptions();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      chrome.tabs.sendMessage(tabs[0].id, { action, options }, (response) => {
        if (chrome.runtime.lastError) {
          outputDiv.textContent = "Error: " + chrome.runtime.lastError.message;
          return;
        }
        if (response && response.markedElements) {
          outputDiv.textContent = JSON.stringify(
            response.markedElements,
            null,
            2
          );
        } else if (response && response.success) {
          outputDiv.textContent = "Unmarked successfully.";
        }
      });
    });
  };

  markPageCheckbox.addEventListener("change", () => {
    const action = markPageCheckbox.checked ? "markPage" : "unmarkPage";
    sendMessageToContentScript(action);
  });

  copyOptionsButton.addEventListener("click", () => {
    const options = getCurrentOptions();
    navigator.clipboard.writeText(JSON.stringify(options, null, 2)).then(() => {
      alert("Options copied to clipboard!");
    });
  });

  refreshButton.addEventListener("click", () => {
    sendMessageToContentScript("refresh");
  });
});
