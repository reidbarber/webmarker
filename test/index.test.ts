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

  test("marks all interactive elements", async () => {
    const elements = await mark();
    let marks = document.querySelectorAll(".webmarker");
    let boundingBoxes = document.querySelectorAll(".webmarker-bounding-box");

    expect(marks.length).toBe(4);
    expect(boundingBoxes.length).toBe(4);
    expect(Object.keys(elements).length).toBe(4);
    expect(isMarked()).toBe(true);

    // Check that data-mark-label gets added
    Object.entries(elements).forEach(([label, { element }]) => {
      expect(element.attributes["data-mark-label"].value).toBe(label);
    });

    // Check that mark elements are added correctly
    marks.forEach((mark) => {
      expect(mark.tagName).toBe("DIV");
      expect(elements.hasOwnProperty(mark.textContent as string)).toBe(true);
    });
  });

  test("assigns correct labels to elements", async () => {
    const options: MarkOptions = {
      getLabel: (_, index) => `Label ${index}`,
    };
    const elements = await mark(options);

    expect(elements["Label 0"].element.tagName).toBe("BUTTON");
    expect(elements["Label 1"].element.tagName).toBe("BUTTON");
    expect(elements["Label 2"].element.tagName).toBe("INPUT");
    expect(elements["Label 3"].element.tagName).toBe("A");
  });

  test("removes marks with unmark()", async () => {
    await mark();
    expect(isMarked()).toBe(true);
    unmark();
    expect(document.querySelector(".webmarker")).toBeNull();
    expect(document.querySelector(".webmarker-bounding-box")).toBeNull();
    expect(isMarked()).toBe(false);
  });

  test("applies custom styles to marks and boundingBoxes", async () => {
    await mark({
      markStyle: { backgroundColor: "blue", color: "red" },
      boundingBoxStyle: { outline: "3px solid green" },
    });

    const markElement = document.querySelector(".webmarker") as HTMLElement;
    const boundingBoxElement = document.querySelector(
      ".webmarker-bounding-box"
    ) as HTMLElement;

    expect(markElement.style.backgroundColor).toBe("blue");
    expect(markElement.textContent).toBe("0");
    expect(markElement.style.color).toBe("red");
    expect(boundingBoxElement.style.outline).toBe("3px solid green");
  });

  test("supports custom attribute", async () => {
    await mark({
      markAttribute: "data-testid",
    });

    const elements = document.querySelectorAll("[data-testid]");
    expect(elements.length).toBe(4);
  });
});
