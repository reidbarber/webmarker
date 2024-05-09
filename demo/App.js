import { unmark, mark } from "../src";
import { useEffect, useState, useRef } from "react";

export function App() {
  let [isMarked, setMarked] = useState(false);
  let [elementMap, setElementMap] = useState(new Map());
  let demoRef = useRef(null);

  useEffect(() => {
    if (!isMarked) {
      let elements = mark({});
      elements.then((res) => setElementMap(res));
      setMarked(true);
    }
  }, []);

  let toggleMark = () => {
    if (isMarked) {
      unmark();
      setMarked(false);
      setElementMap(new Map());
    } else {
      let elements = mark({});
      elements.then((res) => setElementMap(res));
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
          {Array.from(elementMap)
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
