import { unmark, mark } from "../src";
import React, { useState, useRef } from "react";

export function App() {
  let [isMarked, setMarked] = useState(false);
  let [markedElements, setMarkedElements] = useState(null);
  let demoRef = useRef(null);

  let toggleMark = () => {
    if (isMarked) {
      unmark();
      setMarked(false);
      setMarkedElements(null);
    } else {
      let elements = mark({});
      setMarkedElements(elements);
      setMarked(true);
    }
  };

  return (
    <main>
      <h1>WebMarker Demo</h1>
      <button onClick={toggleMark}>{isMarked ? "Unmark" : "Mark"}</button>
      <div ref={demoRef} style={{ display: "flex", flexDirection: "column" }}>
        <h2>Interactive Elements:</h2>
        <div>
          <label htmlFor="field-1">Input:</label>
          <input id="field-1" type="text" />
        </div>

        <div>
          <label htmlFor="field-2">Input:</label>
          <input id="field-2" type="text" />
        </div>

        <div>
          <label htmlFor="field-3">Input:</label>
          <input id="field-3" type="text" />
        </div>

        <div>
          <button>Button 1</button>
          <button>Button 2</button>
        </div>
      </div>
      <div>
        <h2>Marked Elements:</h2>
        <ul>
          {markedElements &&
            Array.from(markedElements)
              .map(([key, value]) => ({ key, value }))
              .map((element) => (
                <li key={element.key}>
                  {element.key} : {element.value.element.tagName}
                </li>
              ))}
        </ul>
      </div>
    </main>
  );
}
