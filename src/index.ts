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

type StyleFunction = (element: Element) => CSSStyleDeclaration;
type StyleObject = Readonly<Partial<CSSStyleDeclaration>>;

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
}

interface MarkedElement {
  element: Element;
  markElement: HTMLElement;
  boundingBoxElement?: HTMLElement;
}

let cleanupFns: (() => void)[] = [];

async function mark(
  options: MarkOptions = {}
): Promise<Record<string, MarkedElement>> {
  const {
    selector = "button, input, a, select, textarea",
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
  } = options;

  const elements = Array.from(
    containerElement.querySelectorAll(selector)
  ).filter(
    (el) => !viewPortOnly || el.getBoundingClientRect().top < window.innerHeight
  );

  const markedElements: Record<string, MarkedElement> = {};

  await Promise.all(
    elements.map(async (element, index) => {
      const label = getLabel(element, index);
      const markElement = createMark(element, markStyle, label, markPlacement);

      const boundingBoxElement = showBoundingBoxes
        ? createBoundingBox(element, boundingBoxStyle, label)
        : undefined;

      markedElements[label] = { element, markElement, boundingBoxElement };
      element.setAttribute(markAttribute, label);
    })
  );

  document.documentElement.setAttribute("data-marked", "true");
  return markedElements;
}

function createMark(
  element: Element,
  style: StyleObject | StyleFunction,
  label: string,
  markPlacement: Placement = "top-start"
): HTMLElement {
  const markElement = document.createElement("div");
  markElement.className = "webmarker";
  markElement.id = `webmarker-${label}`;
  markElement.textContent = label;
  document.body.appendChild(markElement);
  positionMark(markElement, element, markPlacement);
  applyStyle(
    markElement,
    {
      zIndex: "999999999",
      position: "absolute",
      pointerEvents: "none",
    },
    typeof style === "function" ? style(element) : style
  );
  return markElement;
}

function createBoundingBox(
  element: Element,
  style: StyleObject | StyleFunction,
  label: string
): HTMLElement {
  const boundingBoxElement = document.createElement("div");
  boundingBoxElement.className = "webmarker-bounding-box";
  boundingBoxElement.id = `webmarker-bounding-box-${label}`;
  document.body.appendChild(boundingBoxElement);
  positionBoundingBox(boundingBoxElement, element);
  applyStyle(
    boundingBoxElement,
    {
      zIndex: "999999999",
      position: "absolute",
      pointerEvents: "none",
    },
    typeof style === "function" ? style(element) : style
  );
  return boundingBoxElement;
}

function positionMark(
  markElement: HTMLElement,
  element: Element,
  markPlacement: Placement
) {
  async function updatePosition() {
    const { x, y } = await computePosition(element, markElement, {
      placement: markPlacement,
    });
    Object.assign(markElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  }

  cleanupFns.push(autoUpdate(element, markElement, updatePosition));
}

async function positionBoundingBox(boundingBox: HTMLElement, element: Element) {
  const { width, height } = element.getBoundingClientRect();
  async function updatePosition() {
    const { x, y } = await computePosition(element, boundingBox, {
      placement: "top-start",
    });
    Object.assign(boundingBox.style, {
      left: `${x}px`,
      top: `${y + height}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
  }
  cleanupFns.push(autoUpdate(element, boundingBox, updatePosition));
}

function applyStyle(
  element: HTMLElement,
  defaultStyle: Partial<CSSStyleDeclaration>,
  customStyle: Partial<CSSStyleDeclaration>
): void {
  Object.assign(element.style, defaultStyle, customStyle);
}

function unmark(): void {
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
