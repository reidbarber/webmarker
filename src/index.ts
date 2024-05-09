import { computePosition } from "@floating-ui/dom";

interface MarkOptions {
  /**
   * A CSS selector to specify the elements to be marked.
   */
  selector?: string;
  /**
   * A CSS style to apply to the label element.
   * You can also specify a function that returns a CSS style object.
   */
  markStyle?:
    | Partial<CSSStyleDeclaration>
    | ((element: Element) => Partial<CSSStyleDeclaration>);
  /**
   * A CSS style to apply to the bounding box element.
   * You can also specify a function that returns a CSS style object.
   * Bounding boxes are only shown if `showMasks` is `true`.
   */
  maskStyle?:
    | Partial<CSSStyleDeclaration>
    | ((element: Element) => Partial<CSSStyleDeclaration>);
  /**
   * Whether or not to show bounding boxes around the elements.
   *
   * @default true
   */
  showMasks?: boolean;
  /**
   * Provide a function for generating labels.
   * By default, labels are generated as numbers starting from 0.
   */
  labelGenerator?: (element: Element, index: number) => string;
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
  maskElement?: HTMLElement;
}

async function mark(
  options: MarkOptions = {}
): Promise<Map<string, MarkedElement>> {
  const {
    selector = "button, input, a, select, textarea",
    markStyle = {
      backgroundColor: "red",
      color: "white",
      padding: "2px 4px",
      fontSize: "12px",
      fontWeight: "bold",
      zIndex: "9999",
    },
    maskStyle = {
      border: "2px dashed red",
      backgroundColor: "transparent",
    },
    showMasks = true,
    labelGenerator = (_, index) => index.toString(),
    containerElement = document.body,
    viewPortOnly = false,
  } = options;

  const elements = Array.from(
    containerElement.querySelectorAll(selector)
  ).filter(
    (el) => !viewPortOnly || el.getBoundingClientRect().top < window.innerHeight
  );

  const markedElements = new Map<string, MarkedElement>();

  await Promise.all(
    elements.map(async (element, index) => {
      const label = labelGenerator(element, index);
      const markElement = document.createElement("div");
      markElement.textContent = label;
      markElement.className = "webmarker";
      markElement.id = `webmarker-${label}`;
      document.body.appendChild(markElement);
      const { x, y } = await computePosition(element, markElement, {
        placement: "top-start",
      });
      applyStyle(
        markElement,
        {
          position: "absolute",
          left: `${x}px`,
          top: `${y}px`,
          pointerEvents: "none",
        },
        typeof markStyle === "function" ? markStyle(element) : markStyle
      );

      const maskElement = showMasks
        ? createMask(element, maskStyle, label)
        : undefined;

      markedElements.set(label, { element, markElement, maskElement });
      element.setAttribute("data-webmarkeredby", `webmarker-${label}`);
    })
  );

  document.documentElement.dataset.webmarkered = "true";
  return markedElements;
}

function createMask(
  element: Element,
  style:
    | Partial<CSSStyleDeclaration>
    | ((element: Element) => Partial<CSSStyleDeclaration>),
  label: string
): HTMLElement {
  const mask = document.createElement("div");
  mask.className = "webmarkermask";
  mask.id = `webmarkermask-${label}`;
  document.body.appendChild(mask);
  positionMask(mask, element);
  applyStyle(
    mask,
    {
      pointerEvents: "none",
    },
    typeof style === "function" ? style(element) : style
  );
  return mask;
}

async function positionMask(
  mask: HTMLElement,
  element: Element
): Promise<void> {
  const { x, y, width, height } = element.getBoundingClientRect();
  const { x: maskX, y: maskY } = await computePosition(element, mask, {
    placement: "top-start",
    strategy: "fixed",
  });
  Object.assign(mask.style, {
    position: "fixed",
    left: `${maskX}px`,
    top: `${maskY}px`,
    width: `${width}px`,
    height: `${height}px`,
  });
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
    .querySelectorAll(".webmarker, .webmarkermask")
    .forEach((el) => el.remove());
  document.documentElement.removeAttribute("data-webmarkered");
}

function isMarked(): boolean {
  return document.documentElement.hasAttribute("data-webmarkered");
}

export { mark, unmark, isMarked };
export type { MarkOptions, MarkedElement };
