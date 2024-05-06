# WebMark

WebMark is a library for marking web pages for [Set-of-Mark (SoM)](https://github.com/microsoft/SoM) prompting.

## Overview

WebMark adds visual markings with labels to elements on a web page. This can be used to improve visual grounding abilities of vision-language models such as GPT-4V, Claude 3, and Google Gemini 1.5.

The `mark()` function will add markings for all interactive elements on a web page, and return a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) of the elements. The returned Map's keys are the mark labels, and the values are an object with the element (`element`) and marking element (`markElement`).

## Usage

```javascript
// Mark interactive elements on the document
let elements = mark();

// Reference an element by label
console.log(elements.get("0").element);

// Remove markings
unMark();
```

### Advanced

```javascript
let elements = mark({
  // A custom CSS selector for which elements to mark
  selector: "button, input",
  // A custom CSS style to apply to the mark element
  markStyle: { color: "white", backgroundColor: "blue", padding: 5 },
  // Whether or not to show bounding boxes around the elements
  showMasks: true,
  // A custom CSS style to apply to the bounding box element
  maskStyle: { border: "2px dashed blue", backgroundColor: "transparent" },
  // A custom function for generating the labels
  labelGenerator: (element, index) => `Element ${index}`,
  // A container element to query the elements to be marked
  containerElement: document.body,
  // Only mark elements that are visible in the current viewport
  viewPortOnly: true,
});

// Cleanup
unMark();
```

## Playwright Use Case

```javascript
import { chromium, devices } from "playwright";
import { mark } from "webmark";

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://example.com/");

  await page.evaluate((mark) => {
    let elements = mark();
  }, mark);

  await context.close();
  await browser.close();
})();
```
