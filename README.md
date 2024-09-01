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

**WebMarker** adds visual markings with labels to elements on a web page. This can be used for [Set-of-Mark (SoM)](https://github.com/microsoft/SoM) prompting, which improves visual grounding abilities of vision-language models such as GPT-4o, Claude 3.5, and Google Gemini 1.5.

## How it works

**1. Call the `mark()` function**

This marks the interactive elements on the page, and returns an object containing the marked elements, where each key is a mark label string, and each value is an object with the following properties:

- `element`: The interactive element that was marked.
- `markElement`: The label element that was added to the page.
- `maskElement`: The bounding box element that was added to the page.

You can use this information to build your prompt for the vision-language model.

**2. Send a screenshot of the marked page to a vision-language model, along with your prompt**

Example prompt:

```javascript
let markedElements = await mark();

let prompt = `The following is a screenshot of a web page.

Interactive elements have been marked with red bounding boxes and labels.

When referring to elements, use the labels to identify them.

Return an action and element to perform the action on.

Available actions: click, hover

Available elements:
${Object.keys(markedElements)
  .map((label) => `- ${label}`)
  .join("\n")}

Example response: click 0
`;
```

**3. Programmatically interact with the marked elements.**

In a web browser (i.e. via Playwright), interact with elements as needed.

For prompting or agent ideas, see the [WebVoyager](https://arxiv.org/abs/2401.13919) paper.

## Playwright example

```javascript
// Inject the WebMarker library into the page
await page.addScriptTag({
  url: "https://cdn.jsdelivr.net/npm/webmarker-js/dist/main.js",
});

// Mark the page and get the marked elements
let markedElements = await page.evaluate(async () => await WebMarker.mark());

// (Optional) Check if page is marked
let isMarked = await page.evaluate(async () => await WebMarker.isMarked());

// (Optional) Unmark the page
await page.evaluate(async () => await WebMarker.unmark());
```

## Options

### selector

A custom CSS selector to specify which elements to mark.

- Type: `string`
- Default: `"button, input, a, select, textarea"`

### markStyle

A CSS style to apply to the label element. You can also specify a function that returns a CSS style object.

- Type: `Readonly<Partial<CSSStyleDeclaration>> or (element: Element) => Readonly<Partial<CSSStyleDeclaration>>`
- Default: `{backgroundColor: "red", color: "white", padding: "2px 4px", fontSize: "12px", fontWeight: "bold"}`

### markPlacement

The placement of the mark relative to the element.

- Type: `'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end'`
- Default: `'top-start'`

### maskStyle

A CSS style to apply to the bounding box element. You can also specify a function that returns a CSS style object. Bounding boxes are only shown if showMasks is true.

- Type: `Readonly<Partial<CSSStyleDeclaration>> or (element: Element) => Readonly<Partial<CSSStyleDeclaration>>`
- Default: `{outline: "2px dashed red", backgroundColor: "transparent"}`

### showMasks

Whether or not to show bounding boxes around the elements.

- Type: `boolean`
- Default: `true`

### labelGenerator

Provide a function for generating labels. By default, labels are generated as integers starting from 0.

- Type: `(element: Element, index: number) => string`
- Default: `(_, index) => index.toString()`

### containerElement

Provide a container element to query the elements to be marked. By default, the container element is document.body.

- Type: `Element`
- Default: `document.body`

### viewPortOnly

Only mark elements that are visible in the current viewport.

- Type: `boolean`
- Default: `false`

### Advanced example

```typescript
const markedElements = await mark({
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
```
