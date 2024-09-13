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
    const elements = mark();
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
    const elements = mark(options);

    expect(elements["Label 0"].element.tagName).toBe("BUTTON");
    expect(elements["Label 1"].element.tagName).toBe("BUTTON");
    expect(elements["Label 2"].element.tagName).toBe("INPUT");
    expect(elements["Label 3"].element.tagName).toBe("A");
  });

  test("removes marks with unmark()", async () => {
    mark();
    expect(isMarked()).toBe(true);
    unmark();
    expect(document.querySelector(".webmarker")).toBeNull();
    expect(document.querySelector(".webmarker-bounding-box")).toBeNull();
    expect(isMarked()).toBe(false);
  });

  test("applies custom styles to marks and boundingBoxes", async () => {
    mark({
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
    mark({
      markAttribute: "data-testid",
    });

    const elements = document.querySelectorAll("[data-testid]");
    expect(elements.length).toBe(4);
  });

  test("uses custom selector", async () => {
    const elements = mark({ selector: "button" });
    expect(Object.keys(elements).length).toBe(2);
    expect(document.querySelectorAll(".webmarker").length).toBe(2);
  });

  test("uses custom getLabel function", async () => {
    const elements = mark({
      getLabel: (element) => element.tagName.toLowerCase(),
    });
    expect(elements["button"].element.tagName).toBe("BUTTON");
    expect(elements["input"].element.tagName).toBe("INPUT");
    expect(elements["a"].element.tagName).toBe("A");
  });

  test("applies correct markPlacement", async () => {
    mark({ markPlacement: "bottom-end" });
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

    const elements = mark({ viewPortOnly: true });
    expect(Object.keys(elements).length).toBe(3); // Second button should be excluded
  });

  test("uses custom containerElement", async () => {
    const container = document.getElementById("container") as HTMLElement;
    const elements = mark({ containerElement: container });
    expect(Object.keys(elements).length).toBe(4);
  });

  test("applies function-based styles", async () => {
    mark({
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
    mark({ showBoundingBoxes: false });
    expect(document.querySelectorAll(".webmarker-bounding-box").length).toBe(0);
  });

  test("handles pages with no interactive elements", async () => {
    document.body.innerHTML = "<div>No interactive elements</div>";
    const elements = mark();
    expect(Object.keys(elements).length).toBe(0);
  });

  test("can mark and unmark multiple times", async () => {
    mark();
    expect(isMarked()).toBe(true);
    unmark();
    expect(isMarked()).toBe(false);
    mark();
    expect(isMarked()).toBe(true);
    unmark();
    expect(isMarked()).toBe(false);
  });

  test("applies custom markClass to mark elements", () => {
    mark({ markClass: "custom-mark" });
    const markElements = document.querySelectorAll(".webmarker.custom-mark");
    expect(markElements.length).toBe(4);
  });

  test("applies custom boundingBoxClass to bounding box elements", () => {
    mark({ boundingBoxClass: "custom-box" });
    const boxElements = document.querySelectorAll(
      ".webmarker-bounding-box.custom-box"
    );
    expect(boxElements.length).toBe(4);
  });

  test("uses DocumentFragment for better performance", () => {
    const appendChildSpy = jest.spyOn(document.body, "appendChild");
    mark();
    expect(appendChildSpy).toHaveBeenCalledTimes(1);
    expect(
      appendChildSpy.mock.calls[0][0] instanceof DocumentFragment
    ).toBeTruthy();
    appendChildSpy.mockRestore();
  });

  test("handles errors gracefully", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => mark({ selector: "div::" })).toThrow(); // Invlaid selector
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error in mark function:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  test("adds aria-hidden attribute to mark and bounding box elements", () => {
    mark();
    const markElements = document.querySelectorAll(".webmarker");
    const boxElements = document.querySelectorAll(".webmarker-bounding-box");

    markElements.forEach((el) =>
      expect(el.getAttribute("aria-hidden")).toBe("true")
    );
    boxElements.forEach((el) =>
      expect(el.getAttribute("aria-hidden")).toBe("true")
    );
  });

  test("unmark function removes markAttribute from elements", () => {
    mark();
    const markedElements = document.querySelectorAll("[data-mark-label]");
    expect(markedElements.length).toBe(4);

    unmark();
    const unmarkedElements = document.querySelectorAll("[data-mark-label]");
    expect(unmarkedElements.length).toBe(0);
  });

  test("supports both data-mark-label and data-webmarker-label attributes", () => {
    mark({ markAttribute: "data-webmarker-label" });
    const elements = document.querySelectorAll("[data-webmarker-label]");
    expect(elements.length).toBe(4);

    unmark();
    const unmarkedElements = document.querySelectorAll(
      "[data-webmarker-label]"
    );
    expect(unmarkedElements.length).toBe(0);
  });

  test("isInViewport function correctly identifies visible elements", () => {
    const originalGetBoundingClientRect =
      Element.prototype.getBoundingClientRect;
    const originalInnerHeight = window.innerHeight;
    window.innerHeight = 100;

    Element.prototype.getBoundingClientRect = function () {
      if (this.tagName === "BUTTON" && this.textContent === "Button 1") {
        return { top: -10, bottom: 10 } as DOMRect; // First button partially visible
      } else if (this.tagName === "BUTTON" && this.textContent === "Button 2") {
        return { top: 20, bottom: 40 } as DOMRect; // Second button fully visible
      } else if (this.tagName === "INPUT") {
        return { top: 50, bottom: 70 } as DOMRect; // Input fully visible
      } else if (this.tagName === "A") {
        return { top: 110, bottom: 130 } as DOMRect; // Link not visible
      }
      return { top: 0, bottom: 0 } as DOMRect;
    };

    const elements = mark({ viewPortOnly: true });
    expect(Object.keys(elements).length).toBe(3); // Two buttons and input should be marked

    // Restore original functions
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    window.innerHeight = originalInnerHeight;
  });

  test("handles non-integer labels gracefully", () => {
    mark({
      getLabel: (_, index) => `Label ${index + 1}`,
      markStyle: (_, index) => ({
        backgroundColor: index % 2 === 0 ? "red" : "blue",
      }),
    });

    const markElements = document.querySelectorAll(
      ".webmarker"
    ) as NodeListOf<HTMLElement>;
    expect(markElements[0].style.backgroundColor).toBe("red");
    expect(markElements[1].style.backgroundColor).toBe("blue");
  });
});
