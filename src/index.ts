interface WebMarkOptions {
  /**
   * A CSS selector to specify the elements to be marked.
   */
  selector?: string;
  /**
   * A CSS style to apply to the label element.
   * You can also specify a function that returns a CSS style object.
   */
  labelStyle?:
    | Partial<CSSStyleDeclaration>
    | ((element: Element) => Partial<CSSStyleDeclaration>);
  /**
   * A CSS style to apply to the bounding box element.
   * You can also specify a function that returns a CSS style object.
   * Bounding boxes are only shown if `showBoundingBox` is `true`.
   */
  boundingBoxStyle?:
    | Partial<CSSStyleDeclaration>
    | ((element: Element) => Partial<CSSStyleDeclaration>);
  /**
   * Whether or not to show bounding boxes around the elements.
   */
  showBoundingBox?: boolean;
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
}

const defaultOptions: WebMarkOptions = {
  selector: "button, a, input, select, textarea",
  labelStyle: {
    color: "white",
    backgroundColor: "red",
    padding: "2px 4px",
    fontSize: "12px",
    fontWeight: "bold",
    position: "absolute",
    transform: "translate(-50%, -50%)",
    zIndex: "9999",
  },
  boundingBoxStyle: {
    border: "2px solid red",
    borderRadius: "2px",
  },
  showBoundingBox: false,
  labelGenerator: (_, index) => `${index}`,
  containerElement: document.body,
};

function createLabelElement(
  label: string,
  options: WebMarkOptions,
  element: Element
): HTMLElement {
  const labelElement = document.createElement("div");
  labelElement.classList.add("webmark-label");
  labelElement.textContent = label;
  labelElement.dataset.key = label;

  const labelStyle =
    typeof options.labelStyle === "function"
      ? options.labelStyle(element)
      : options.labelStyle;
  Object.assign(labelElement.style, labelStyle);

  return labelElement;
}

function createBoundingBoxElement(
  element: Element,
  options: WebMarkOptions
): HTMLElement {
  const boundingBoxElement = document.createElement("div");
  boundingBoxElement.classList.add("webmark-bounding-box");

  const rect = element.getBoundingClientRect();
  const boundingBoxStyle =
    typeof options.boundingBoxStyle === "function"
      ? options.boundingBoxStyle(element)
      : options.boundingBoxStyle;
  Object.assign(boundingBoxElement.style, boundingBoxStyle, {
    position: "absolute",
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: "9998",
  });

  return boundingBoxElement;
}

function findCenter(element: Element): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function markAllocation(
  elements: Element[],
  options: WebMarkOptions
): Map<
  string,
  { element: Element; label: HTMLElement; boundingBox?: HTMLElement }
> {
  const labeledElements = new Map<
    string,
    { element: Element; label: HTMLElement; boundingBox?: HTMLElement }
  >();

  // Sort elements in ascending order of areas
  const sortedElements = [...elements].sort(
    (a, b) =>
      a.getBoundingClientRect().width * a.getBoundingClientRect().height -
      b.getBoundingClientRect().width * b.getBoundingClientRect().height
  );

  for (let k = 0; k < sortedElements.length; k++) {
    const element = sortedElements[k];
    const excludedElements = sortedElements.slice(0, k);

    // Exclude regions covered by previous elements
    if (
      excludedElements.some((excludedElement) =>
        excludedElement.contains(element)
      )
    ) {
      continue;
    }

    const center = findCenter(element);
    const label = options.labelGenerator(element, k);
    const labelElement = createLabelElement(label, options, element);

    labelElement.style.left = `${center.x}px`;
    labelElement.style.top = `${center.y}px`;

    options.containerElement.appendChild(labelElement);

    let boundingBoxElement: HTMLElement | undefined;
    if (options.showBoundingBox) {
      boundingBoxElement = createBoundingBoxElement(element, options);
      options.containerElement.appendChild(boundingBoxElement);
    }

    labeledElements.set(label, {
      element,
      label: labelElement,
      boundingBox: boundingBoxElement,
    });
  }

  return labeledElements;
}

function mark(
  options?: WebMarkOptions
): Map<
  string,
  { element: Element; label: HTMLElement; boundingBox?: HTMLElement }
> {
  const mergedOptions = { ...defaultOptions, ...options };
  const elements = Array.from(
    document.querySelectorAll(mergedOptions.selector)
  );

  if (!mergedOptions.containerElement) {
    throw new Error("Container element is not specified.");
  }

  return markAllocation(elements, mergedOptions);
}

function removeLabelByKey(
  key: string,
  containerElement: Element = document.body
): void {
  const labelElement = containerElement.querySelector(
    `.webmark-label[data-key="${key}"]`
  );
  const boundingBoxElement = containerElement.querySelector(
    `.webmark-bounding-box[data-key="${key}"]`
  );

  if (labelElement) {
    labelElement.remove();
  }
  if (boundingBoxElement) {
    boundingBoxElement.remove();
  }
}

function updateLabels(
  labeledElements: Map<
    string,
    { element: Element; label: HTMLElement; boundingBox?: HTMLElement }
  >,
  options?: WebMarkOptions
): void {
  const mergedOptions = { ...defaultOptions, ...options };

  labeledElements.forEach(({ element, label, boundingBox }, key) => {
    const newLabel = mergedOptions.labelGenerator(
      element,
      Array.from(labeledElements.keys()).indexOf(key)
    );
    label.textContent = newLabel;

    const labelStyle =
      typeof mergedOptions.labelStyle === "function"
        ? mergedOptions.labelStyle(element)
        : mergedOptions.labelStyle;
    Object.assign(label.style, labelStyle);

    if (boundingBox && mergedOptions.showBoundingBox) {
      const boundingBoxStyle =
        typeof mergedOptions.boundingBoxStyle === "function"
          ? mergedOptions.boundingBoxStyle(element)
          : mergedOptions.boundingBoxStyle;
      Object.assign(boundingBox.style, boundingBoxStyle);
    }
  });
}

function cleanup(containerElement: Element = document.body): void {
  const labelElements = containerElement.querySelectorAll(".webmark-label");
  const boundingBoxElements = containerElement.querySelectorAll(
    ".webmark-bounding-box"
  );

  labelElements.forEach((element) => element.remove());
  boundingBoxElements.forEach((element) => element.remove());
}

export { mark, removeLabelByKey, updateLabels, cleanup, WebMarkOptions };
