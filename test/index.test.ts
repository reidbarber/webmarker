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

  test("marks all interactive elements", () => {
    const elements = mark();
    const marks = document.querySelectorAll(".webmarker");
    const boundingBoxes = document.querySelectorAll(".webmarker-bounding-box");

    expect(marks.length).toBe(4);
    expect(boundingBoxes.length).toBe(4);
    expect(Object.keys(elements).length).toBe(4);
    expect(isMarked()).toBe(true);

    // Check that data-mark-label gets added
    Object.entries(elements).forEach(([label, { element }]) => {
      expect(element.getAttribute("data-mark-label")).toBe(label);
    });

    // Check that mark elements are added correctly
    marks.forEach((mark) => {
      expect(mark.tagName).toBe("DIV");
      expect(elements.hasOwnProperty(mark.textContent as string)).toBe(true);
    });
  });

  test("assigns correct labels to elements", () => {
    const options: MarkOptions = {
      getLabel: (_, index) => `Label ${index}`,
    };
    const elements = mark(options);

    expect(elements["Label 0"].element.tagName).toBe("BUTTON");
    expect(elements["Label 1"].element.tagName).toBe("BUTTON");
    expect(elements["Label 2"].element.tagName).toBe("INPUT");
    expect(elements["Label 3"].element.tagName).toBe("A");
  });

  test("removes marks with unmark()", () => {
    mark();
    expect(isMarked()).toBe(true);
    unmark();
    expect(document.querySelector(".webmarker")).toBeNull();
    expect(document.querySelector(".webmarker-bounding-box")).toBeNull();
    expect(isMarked()).toBe(false);
  });

  test("applies custom styles to marks and boundingBoxes", () => {
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

  test("supports custom attribute", () => {
    mark({
      markAttribute: "data-testid",
    });

    const elements = document.querySelectorAll("[data-testid]");
    expect(elements.length).toBe(4);
  });

  test("uses custom selector", () => {
    const elements = mark({ selector: "button" });
    expect(Object.keys(elements).length).toBe(2);
    expect(document.querySelectorAll(".webmarker").length).toBe(2);
  });

  test("uses custom getLabel function", () => {
    const elements = mark({
      getLabel: (element) => element.tagName.toLowerCase(),
    });
    expect(elements["button"].element.tagName).toBe("BUTTON");
    expect(elements["input"].element.tagName).toBe("INPUT");
    expect(elements["a"].element.tagName).toBe("A");
  });

  test("applies correct markPlacement", () => {
    mark({ markPlacement: "bottom-end" });
    const firstMark = document.querySelector(".webmarker") as HTMLElement;
    const firstElement = document.querySelector("button") as HTMLElement;
    const elementRect = firstElement.getBoundingClientRect();
    const markRect = firstMark.getBoundingClientRect();

    expect(markRect.bottom).toBeGreaterThanOrEqual(elementRect.bottom);
    expect(markRect.right).toBeGreaterThanOrEqual(elementRect.right);
  });

  test("marks only viewport elements when viewPortOnly is true", () => {
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

    // Restore original getBoundingClientRect
    delete (HTMLElement.prototype as any).getBoundingClientRect;
  });

  test("uses custom containerElement", () => {
    const container = document.getElementById("container") as HTMLElement;
    const elements = mark({ containerElement: container });
    expect(Object.keys(elements).length).toBe(4);
  });

  test("applies function-based styles", () => {
    mark({
      markStyle: (element) => ({
        backgroundColor: element.tagName === "BUTTON" ? "green" : "blue",
      }),
      boundingBoxStyle: (element) => ({
        outline:
          element.tagName === "INPUT" ? "3px solid purple" : "2px dashed red",
      }),
    });

    const markElements = document.querySelectorAll(
      ".webmarker"
    ) as NodeListOf<HTMLElement>;
    const inputBoundingBox = document.querySelectorAll(
      ".webmarker-bounding-box"
    )[2] as HTMLElement;

    expect(markElements[0].style.backgroundColor).toBe("green");
    expect(inputBoundingBox.style.outline).toBe("3px solid purple");
  });

  test("doesn't show bounding boxes when showBoundingBoxes is false", () => {
    mark({ showBoundingBoxes: false });
    expect(document.querySelectorAll(".webmarker-bounding-box").length).toBe(0);
  });

  test("handles pages with no interactive elements", () => {
    document.body.innerHTML = "<div>No interactive elements</div>";
    const elements = mark();
    expect(Object.keys(elements).length).toBe(0);
  });

  test("can mark and unmark multiple times", () => {
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
    expect(() => mark({ selector: "div::" })).toThrow(); // Invalid selector
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
        return { top: -10, bottom: 10, left: 0, right: 100 } as DOMRect; // Partially visible
      } else if (this.tagName === "BUTTON" && this.textContent === "Button 2") {
        return { top: 20, bottom: 40, left: 0, right: 100 } as DOMRect; // Fully visible
      } else if (this.tagName === "INPUT") {
        return { top: 50, bottom: 70, left: 0, right: 100 } as DOMRect; // Fully visible
      } else if (this.tagName === "A") {
        return { top: 110, bottom: 130, left: 0, right: 100 } as DOMRect; // Not visible
      }
      return { top: 0, bottom: 0, left: 0, right: 0 } as DOMRect;
    };

    const elements = mark({ viewPortOnly: true });
    expect(Object.keys(elements).length).toBe(3); // Excludes second button

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
    expect(markElements[2].style.backgroundColor).toBe("red");
    expect(markElements[3].style.backgroundColor).toBe("blue");
  });

  test("marks a robust set of default interactive elements", () => {
    document.body.innerHTML = `
      <div role="button">Div with role="button"</div>
      <a>Anchor without href</a>
      <a href="#test">Anchor with href</a>
      <input type="hidden" />
      <input type="text" />
      <summary>Summary element</summary>
      <div tabindex="0">Div with tabindex=0</div>
      <div tabindex="-1">Div with tabindex=-1 (not interactive)</div>
    `;

    const elements = mark();
    const markCount = Object.keys(elements).length;
    const webmarkers = document.querySelectorAll(".webmarker");

    // We expect to mark:
    // 1. <div role="button">          (yes)
    // 2. <a href="#test">             (yes)
    // 3. <input type="text">          (yes)
    // 4. <summary>                    (yes)
    // 5. <div tabindex="0">           (yes)
    // => total 5

    // Not marked:
    // - <a> without href
    // - <input type="hidden">
    // - <div tabindex="-1">
    expect(markCount).toBe(5);
    expect(webmarkers.length).toBe(5);

    expect(
      Array.from(webmarkers).some(
        (el) =>
          el.textContent &&
          elements[el.textContent]?.element.matches('[role="button"]')
      )
    ).toBe(true);

    expect(
      Array.from(webmarkers).some(
        (el) =>
          el.textContent &&
          elements[el.textContent]?.element.matches('a[href="#test"]')
      )
    ).toBe(true);

    expect(
      Array.from(webmarkers).some(
        (el) =>
          el.textContent &&
          elements[el.textContent]?.element.matches('input[type="text"]')
      )
    ).toBe(true);

    expect(
      Array.from(webmarkers).some(
        (el) =>
          el.textContent &&
          elements[el.textContent]?.element.matches('summary')
      )
    ).toBe(true);

    expect(
      Array.from(webmarkers).some(
        (el) =>
          el.textContent &&
          elements[el.textContent]?.element.matches('div[tabindex="0"]')
      )
    ).toBe(true);

    expect(isMarked()).toBe(true);

    unmark();
    expect(isMarked()).toBe(false);
  });
});
