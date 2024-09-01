<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/reidbarber/webmarker/assets/8961049/cd3fd0ff-b31f-42b3-b225-207ffded1640">
    <img width="400px" alt="WebMarker" src="https://github.com/reidbarber/webmarker/assets/8961049/b017e0c2-a2f7-4b4d-a1e9-9b2cc91d8ae6">
  </picture>
</p>

<p align="center">
Mark web pages for use with vision-language models.
</p>

## Overview

🚧 Under Construction

**WebMarker** adds visual markings with labels to elements on a web page. This can be used for [Set-of-Mark (SoM)](https://github.com/microsoft/SoM) prompting, which improves visual grounding abilities of vision-language models such as GPT-4V, Claude 3, and Google Gemini 1.5.

## Usage

The `mark()` function will add markings for all interactive elements on a web page, and return an object containing the marked elements. The returned objects's keys are the mark labels, and the values are an object with the element (`element`), mark element (`markElement`), and mask element (`maskElement`).

```javascript
import { mark, unmark } from "webmarker-js";

// Mark interactive elements on the document
let elements = await mark();

// Reference an element by label
console.log(elements["0"].element);

// Remove markings
unmark();
```

## Options

- **selector**: A custom CSS selector to specify which elements to mark.
  - Type: `string`
  - Default: `"button, input, a, select, textarea"`
- **markStyle**: A CSS style to apply to the label element. You can also specify a function that returns a CSS style object.
  - Type: `Readonly<Partial<CSSStyleDeclaration>> or (element: Element) => Readonly<Partial<CSSStyleDeclaration>>`
  - Default: `{backgroundColor: "red", color: "white", padding: "2px 4px", fontSize: "12px", fontWeight: "bold"}`
- **markPlacement**: The placement of the mark relative to the element.
  - Type: `'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end'`
  - Default: `'top-start'`
- **maskStyle**: A CSS style to apply to the bounding box element. You can also specify a function that returns a CSS style object. Bounding boxes are only shown if showMasks is true.
  - Type: `Readonly<Partial<CSSStyleDeclaration>> or (element: Element) => Readonly<Partial<CSSStyleDeclaration>>`
  - Default: `{outline: "2px dashed red", backgroundColor: "transparent"}`
- **showMasks**: Whether or not to show bounding boxes around the elements.
  - Type: `boolean`
  - Default: `true`
- **labelGenerator**: Provide a function for generating labels. By default, labels are generated as numbers starting from 0.
  - Type: `(element: Element, index: number) => string`
  - Default: `(_, index) => index.toString()`
- **containerElement**: Provide a container element to query the elements to be marked. By default, the container element is document.body.
  - Type: `Element`
  - Default: `document.body`
- **viewPortOnly**: Only mark elements that are visible in the current viewport.
  - Type: `boolean`
  - Default: `false`

### Advanced example

```typescript
let elements = mark({
  // Only mark buttons and inputs
  selector: "button, input",
  // Use a blue mark with white text
  markStyle: { color: "white", backgroundColor: "blue", padding: 5 },
  // Use a blue dashed outline mask with a transparent and slighly blue background
  maskStyle: { outline: "2px dashed blue", backgroundColor: "rgba(0, 0, 255, 0.1)"},
  // Place the mark at the top right corner of the element
  markPlacement: "top-end";
  // Show masks over elements (defaults to true)
  showMasks: true,
  // Generate labels as 'Element 0', 'Element 1', 'Element 2'...
  // Defaults to '0', '1', '2'... if not provided.
  labelGenerator: (element, index) => `Element ${index}`,
  // A custom container element to query the elements to be marked.
  // Defaults to the document.body.
  containerElement: document.body.querySelector("main"),
  // Only mark elements that are visible in the current viewport
  viewPortOnly: true,
});

// Cleanup
unmark();
```

## Use with Playwright

Coming soon
