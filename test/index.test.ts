import { mark, unMark, isMarked, WebMarkOptions } from "../src/index";
import { describe, expect, test, beforeEach, afterEach } from "@jest/globals";

describe("WebMark", () => {
  beforeEach(() => {
    document.body.innerHTML = `
    <button>Button 1</button>
    <button>Button 2</button>
    <input type="text" placeholder="Input field" />
    <a href="#">Link</a>
  `;
  });

  afterEach(() => {
    unMark();
  });

  test("marks all interactive elements", () => {
    const elements = mark();
    expect(elements.size).toBe(4);
    expect(isMarked()).toBe(true);
  });

  test("assigns correct labels to elements", () => {
    const options: WebMarkOptions = {
      labelGenerator: (_, index) => `Label ${index}`,
    };
    const elements = mark(options);

    expect(elements.get("Label 0")?.element.tagName).toBe("BUTTON");
    expect(elements.get("Label 1")?.element.tagName).toBe("BUTTON");
    expect(elements.get("Label 2")?.element.tagName).toBe("INPUT");
    expect(elements.get("Label 3")?.element.tagName).toBe("A");
  });

  test("removes marks with unMark()", () => {
    mark();
    unMark();
    expect(document.querySelector(".webmark")).toBeNull();
    expect(document.querySelector(".webmarkmask")).toBeNull();
    expect(isMarked()).toBe(false);
  });

  test("applies custom styles to marks and masks", () => {
    const customMarkStyle = { backgroundColor: "blue", color: "yellow" };
    const customMaskStyle = { border: "3px solid green" };

    mark({
      markStyle: customMarkStyle,
      maskStyle: customMaskStyle,
      showMasks: true,
    });

    const markElement = document.querySelector(".webmark") as HTMLElement;
    const maskElement = document.querySelector(".webmarkmask") as HTMLElement;

    expect(markElement.style.backgroundColor).toBe("blue");
    expect(markElement.style.color).toBe("yellow");
    expect(maskElement.style.border).toBe("3px solid green");
  });
});
