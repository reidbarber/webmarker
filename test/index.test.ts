import { mark, unmark, isMarked, MarkOptions } from "../src/index";
import { describe, expect, test, beforeEach, afterEach } from "@jest/globals";

describe("WebMarker", () => {
  beforeEach(() => {
    document.body.innerHTML = `
    <button>Button 1</button>
    <button>Button 2</button>
    <input type="text" placeholder="Input field" />
    <a href="#">Link</a>
  `;
  });

  afterEach(() => {
    unmark();
  });

  test("marks all interactive elements", () => {
    const elements = mark();
    expect(elements.size).toBe(4);
    expect(isMarked()).toBe(true);
  });

  test("assigns correct labels to elements", () => {
    const options: MarkOptions = {
      labelGenerator: (_, index) => `Label ${index}`,
    };
    const elements = mark(options);

    expect(elements.get("Label 0")?.element.tagName).toBe("BUTTON");
    expect(elements.get("Label 1")?.element.tagName).toBe("BUTTON");
    expect(elements.get("Label 2")?.element.tagName).toBe("INPUT");
    expect(elements.get("Label 3")?.element.tagName).toBe("A");
  });

  test("removes marks with unmark()", () => {
    mark();
    unmark();
    expect(document.querySelector(".webmarker")).toBeNull();
    expect(document.querySelector(".webmarkermask")).toBeNull();
    expect(isMarked()).toBe(false);
  });

  test("applies custom styles to marks and masks", () => {
    const customMarkStyle = { backgroundColor: "blue", color: "yellow" };
    const customMaskStyle = { outline: "3px solid green" };

    mark({
      markStyle: customMarkStyle,
      maskStyle: customMaskStyle,
      showMasks: true,
    });

    const markElement = document.querySelector(".webmarker") as HTMLElement;
    const maskElement = document.querySelector(".webmarkermask") as HTMLElement;

    expect(markElement.style.backgroundColor).toBe("blue");
    expect(markElement.style.color).toBe("yellow");
    expect(maskElement.style.outline).toBe("3px solid green");
  });
});
