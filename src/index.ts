import { autoUpdate, computePosition } from "@floating-ui/dom";

type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";

type StyleFunction = (
  element: Element,
  index: number
) => Partial<CSSStyleDeclaration>;
type StyleObject = Partial<CSSStyleDeclaration>;

interface MarkOptions {
  /**
   * A CSS selector to query the elements to be marked.
   */
  selector?: string;
  /**
   * Provide a function for generating labels.
   * By default, labels are generated as numbers starting from 0.
   */
  getLabel?: (element: Element, index: number) => string;
  /**
   * Name for the attribute added to the marked elements to store the mark label.
   *
   * @default 'data-mark-label'
   */
  markAttribute?: string;
  /**
   * The placement of the mark relative to the element.
   *
   * @default 'top-start'
   */
  markPlacement?: Placement;
  /**
   * A CSS style to apply to the label element.
   * You can also specify a function that returns a CSS style object.
   */
  markStyle?: StyleObject | StyleFunction;
  /**
   * A CSS style to apply to the bounding box element.
   * You can also specify a function that returns a CSS style object.
   * Bounding boxes are only shown if `showBoundingBoxes` is `true`.
   */
  boundingBoxStyle?: StyleObject | StyleFunction;
  /**
   * Whether or not to show bounding boxes around the elements.
   *
   * @default true
   */
  showBoundingBoxes?: boolean;
  /**
   * Provide a container element to query the elements to be marked.
   * By default, the container element is `document.body`.
   */
  containerElement?: Element;
  /**
   * Only mark elements that are visible in the current viewport
   *
   * @default false
   */
  viewPortOnly?: boolean;
  /**
   * Additional class to apply to the mark elements.
   */
  markClass?: string;
  /**
   * Additional class to apply to the bounding box elements.
   */
  boundingBoxClass?: string;
}

interface MarkedElement {
  element: Element;
  markElement: HTMLElement;
  boundingBoxElement?: HTMLElement;
}

let cleanupFns: (() => void)[] = [];

function mark(options: MarkOptions = {}): Record<string, MarkedElement> {
  try {
    const {
      selector = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [tabindex]:not([tabindex="-1"])',
      getLabel = (_, index) => index.toString(),
      markAttribute = "data-mark-label",
      markPlacement = "top-start",
      markStyle = {
        backgroundColor: "red",
        color: "white",
        padding: "2px 4px",
        fontSize: "12px",
        fontWeight: "bold",
      },
      boundingBoxStyle = {
        outline: "2px dashed red",
        backgroundColor: "transparent",
      },
      showBoundingBoxes = true,
      containerElement = document.body,
      viewPortOnly = false,
      markClass = "",
      boundingBoxClass = "",
    } = options;

    const isInViewport = (el: Element) => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom >= 0;
    };

    const elements = Array.from(
      containerElement.querySelectorAll(selector)
    ).filter((el) => !viewPortOnly || isInViewport(el));

    const markedElements: Record<string, MarkedElement> = {};
    const fragment = document.createDocumentFragment();

    elements.forEach((element, index) => {
      const label = getLabel(element, index);
      const markElement = createMark(
        element,
        index,
        markStyle,
        label,
        markPlacement,
        markClass
      );
      fragment.appendChild(markElement);

      const boundingBoxElement = showBoundingBoxes
        ? createBoundingBox(element, index, boundingBoxStyle, label, boundingBoxClass)
        : undefined;
      if (boundingBoxElement) {
        fragment.appendChild(boundingBoxElement);
      }

      markedElements[label] = { element, markElement, boundingBoxElement };
      element.setAttribute(markAttribute, label);
    });

    document.body.appendChild(fragment);
    document.documentElement.setAttribute("data-marked", "true");
    return markedElements;
  } catch (error) {
    console.error("Error in mark function:", error);
    throw error;
  }
}

function createMark(
  element: Element,
  index: number,
  style: StyleObject | StyleFunction,
  label: string,
  markPlacement: Placement = "top-start",
  markClass: string
): HTMLElement {
  const markElement = document.createElement("div");
  markElement.className = `webmarker ${markClass}`.trim();
  markElement.id = `webmarker-${label}`;
  markElement.textContent = label;
  markElement.setAttribute("aria-hidden", "true");
  positionElement(markElement, element, markPlacement, (x, y) => {
    Object.assign(markElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  });
  applyStyle(
    markElement,
    {
      zIndex: "999999999",
      position: "absolute",
      pointerEvents: "none",
    },
    typeof style === "function" ? style(element, index) : style
  );
  return markElement;
}

function createBoundingBox(
  element: Element,
  index: number,
  style: StyleObject | StyleFunction,
  label: string,
  boundingBoxClass: string
): HTMLElement {
  const boundingBoxElement = document.createElement("div");
  boundingBoxElement.className =
    `webmarker-bounding-box ${boundingBoxClass}`.trim();
  boundingBoxElement.id = `webmarker-bounding-box-${label}`;
  boundingBoxElement.setAttribute("aria-hidden", "true");
  positionElement(boundingBoxElement, element, "top-start", (x, y) => {
    const { width, height } = element.getBoundingClientRect();
    Object.assign(boundingBoxElement.style, {
      left: `${x}px`,
      top: `${y + height}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
  });
  applyStyle(
    boundingBoxElement,
    {
      zIndex: "999999999",
      position: "absolute",
      pointerEvents: "none",
    },
    typeof style === "function" ? style(element, index) : style
  );
  return boundingBoxElement;
}

function positionElement(
  target: HTMLElement,
  anchor: Element,
  placement: Placement,
  updateCallback: (x: number, y: number) => void
) {
  function updatePosition() {
    computePosition(anchor, target, { placement }).then(({ x, y }) => {
      updateCallback(x, y);
    });
  }
  cleanupFns.push(autoUpdate(anchor, target, updatePosition));
}

function applyStyle(
  element: HTMLElement,
  defaultStyle: Partial<CSSStyleDeclaration>,
  customStyle: Partial<CSSStyleDeclaration>
): void {
  Object.assign(element.style, defaultStyle, customStyle);
}

function unmark(): void {
  const markAttribute = document
    .querySelector("[data-mark-label]")
    ?.getAttribute("data-mark-label")
    ? "data-mark-label"
    : "data-webmarker-label";

  document.querySelectorAll(`[${markAttribute}]`).forEach((el) => {
    el.removeAttribute(markAttribute);
  });
  document
    .querySelectorAll(".webmarker, .webmarker-bounding-box")
    .forEach((el) => el.remove());
  document.documentElement.removeAttribute("data-marked");
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
}

function isMarked(): boolean {
  return document.documentElement.hasAttribute("data-marked");
}

if (typeof window !== "undefined") {
  window["mark"] = mark;
  window["unmark"] = unmark;
  window["isMarked"] = isMarked;
}

export { mark, unmark, isMarked };
export type { MarkOptions, MarkedElement, Placement };
