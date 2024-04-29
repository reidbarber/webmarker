import {
  mark,
  removeLabelByKey,
  updateLabels,
  cleanup,
  WebMarkOptions,
} from "../src/index";
import { describe, expect, test, beforeEach, afterEach } from "@jest/globals";

describe("WebMark", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="container">
        <button>Button 1</button>
        <a href="#">Link 1</a>
        <input type="text" />
        <div>
          <button>Button 2</button>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    cleanup();
  });

  test("marks elements with default options", () => {
    const labeledElements = mark();

    expect(labeledElements.size).toBe(4);
    expect(document.querySelectorAll(".webmark-label").length).toBe(4);
  });

  test("marks elements with custom options", () => {
    const options: WebMarkOptions = {
      selector: "button",
      labelStyle: {
        backgroundColor: "blue",
      },
    };

    const labeledElements = mark(options);

    expect(labeledElements.size).toBe(2);
    expect(document.querySelectorAll(".webmark-label").length).toBe(2);
    expect(
      (document.querySelectorAll(".webmark-label")[0] as HTMLElement).style
        .backgroundColor
    ).toBe("blue");
  });

  test("marks elements with function-based styles", () => {
    const options: WebMarkOptions = {
      labelStyle: (element) => ({
        color: (element as HTMLElement).tagName === "BUTTON" ? "red" : "green",
      }),
    };

    const labeledElements = mark(options);
    expect(labeledElements.size).toBe(4);

    expect(
      (document.querySelectorAll(".webmark-label")[0] as HTMLElement).style
        .color
    ).toBe("red");
    expect(
      (document.querySelectorAll(".webmark-label")[1] as HTMLElement).style
        .color
    ).toBe("green");
  });

  test("shows bounding box when enabled", () => {
    const options: WebMarkOptions = {
      showBoundingBox: true,
    };

    const labeledElements = mark(options);
    expect(labeledElements.size).toBe(4);

    expect(document.querySelectorAll(".webmark-bounding-box").length).toBe(4);
  });

  test("removes label by key", () => {
    const labeledElements = mark();
    expect(labeledElements.size).toBe(4);
    const labelKey = Array.from(labeledElements.keys())[0];

    removeLabelByKey(labelKey);

    expect(document.querySelectorAll(".webmark-label").length).toBe(3);
  });

  test("updates labels", () => {
    const labeledElements = mark();

    const options: WebMarkOptions = {
      labelGenerator: (_, index) => `Updated ${index}`,
    };

    updateLabels(labeledElements, options);

    expect(document.querySelectorAll(".webmark-label")[0].textContent).toBe(
      "Updated 0"
    );
  });

  test("cleans up labels and bounding boxes", () => {
    mark({ showBoundingBox: true });

    cleanup();

    expect(document.querySelectorAll(".webmark-label").length).toBe(0);
    expect(document.querySelectorAll(".webmark-bounding-box").length).toBe(0);
  });
});
