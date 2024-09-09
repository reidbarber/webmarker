import { mark, unmark, isMarked, MarkOptions } from "../src/index";
import { describe, expect, test, beforeEach, afterEach } from "@jest/globals";

describe("WebMarker", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="container">
        <button>Button 1</button>
        <button>Button 2</button>
        <input type="text" placeholder="Input field" />
        <a href="#">Link</a>
        <div>Non-interactive element</div>
      </div>
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

  test("uses custom selector", async () => {
    const elements = await mark({ selector: "button" });
    expect(Object.keys(elements).length).toBe(2);
    expect(document.querySelectorAll(".webmarker").length).toBe(2);
  });

  test("uses custom getLabel function", async () => {
    const elements = await mark({
      getLabel: (element) => element.tagName.toLowerCase(),
    });
    expect(elements["button"].element.tagName).toBe("BUTTON");
    expect(elements["input"].element.tagName).toBe("INPUT");
    expect(elements["a"].element.tagName).toBe("A");
  });

  test("applies correct markPlacement", async () => {
    await mark({ markPlacement: "bottom-end" });
    const firstMark = document.querySelector(".webmarker") as HTMLElement;
    const firstElement = document.querySelector("button") as HTMLElement;
    const elementRect = firstElement.getBoundingClientRect();
    const markRect = firstMark.getBoundingClientRect();

    expect(markRect.bottom).toBeGreaterThanOrEqual(elementRect.bottom);
    expect(markRect.right).toBeGreaterThanOrEqual(elementRect.right);
  });

  test("marks only viewport elements when viewPortOnly is true", async () => {
    // Mock viewport
    Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value: function () {
        return {
          top: this === document.querySelectorAll("button")[1] ? 1000 : 0,
          bottom: 100,
          left: 0,
          right: 100,
        };
      },
    });

    const elements = await mark({ viewPortOnly: true });
    expect(Object.keys(elements).length).toBe(3); // Second button should be excluded
  });

  test("uses custom containerElement", async () => {
    const container = document.getElementById("container") as HTMLElement;
    const elements = await mark({ containerElement: container });
    expect(Object.keys(elements).length).toBe(4);
  });

  test("applies function-based styles", async () => {
    await mark({
      markStyle: (element) => ({
        backgroundColor: element.tagName === "BUTTON" ? "green" : "blue",
      }),
      boundingBoxStyle: (element) => ({
        outline:
          element.tagName === "INPUT" ? "3px solid purple" : "2px dashed red",
      }),
    });

    const buttonMark = document.querySelectorAll(
      ".webmarker"
    )[0] as HTMLElement;
    const inputBoundingBox = document.querySelectorAll(
      ".webmarker-bounding-box"
    )[2] as HTMLElement;

    expect(buttonMark.style.backgroundColor).toBe("green");
    expect(inputBoundingBox.style.outline).toBe("3px solid purple");
  });

  test("doesn't show bounding boxes when showBoundingBoxes is false", async () => {
    await mark({ showBoundingBoxes: false });
    expect(document.querySelectorAll(".webmarker-bounding-box").length).toBe(0);
  });

  test("handles pages with no interactive elements", async () => {
    document.body.innerHTML = "<div>No interactive elements</div>";
    const elements = await mark();
    expect(Object.keys(elements).length).toBe(0);
  });

  test("can mark and unmark multiple times", async () => {
    await mark();
    expect(isMarked()).toBe(true);
    unmark();
    expect(isMarked()).toBe(false);
    await mark();
    expect(isMarked()).toBe(true);
    unmark();
    expect(isMarked()).toBe(false);
  });
});
