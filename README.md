# WebMarker

A library for marking web pages for [Set-of-Mark (SoM)](https://github.com/microsoft/SoM) prompting.

## Overview

WebMarker adds visual markings with labels to elements on a web page. This can be used to improve visual grounding abilities of vision-language models such as GPT-4V, Claude 3, and Google Gemini 1.5.

The `mark()` function will add markings for all interactive elements on a web page, and return a Map of the marked elements. The returned Map's keys are the mark labels, and the values are an object with the element (`element`), mark element (`markElement`), and mask element (`markElement`).

## Usage

```javascript
import { mark, unmark } from "webmarker";

// Mark interactive elements on the document
let elements = await mark();

// Reference an element by label
console.log(elements.get("0").element);

// Remove markings
unmark();
```

### Options

```javascript
let elements = mark({
  // A custom CSS selector for which elements to mark.
  // The default selector will select all interactive elements.
  selector: "button, input",
  // A custom CSS style to apply to the mark element.
  markStyle: { color: "white", backgroundColor: "blue", padding: 5 },
  // A custom CSS style to apply to the mask element.
  // Use a transparent background to have it act as a bounding box.
  maskStyle: { outline: "2px dashed blue", backgroundColor: "transparent" },
  // The placement of the mark relative to the element.
  markPlacement: "top-start";
  // Whether or not to show masks over elements.
  // Defaults to true.
  showMasks: true,
  // A custom function for generating the labels.
  // Defaults to '0', '1', '2'... if not provided.
  labelGenerator: (element, index) => `Element ${index}`,
  // A container element to query the elements to be marked.
  // Defaults to the document.
  containerElement: document.body,
  // Only mark elements that are visible in the current viewport
  viewPortOnly: true,
});

// Cleanup
unmark();
```

## Use with Playwright

Coming soon
