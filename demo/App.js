import { unmark, mark } from "../src";
import { useEffect, useState, useRef } from "react";

export function App() {
  let [isMarked, setMarked] = useState(false);
  let [elementMap, setElementMap] = useState(null);
  let demoRef = useRef(null);

  useEffect(() => {
    if (!isMarked) {
      let elements = mark({});
      setElementMap(elements);
      setMarked(true);
    }
  }, []);

  let toggleMark = () => {
    if (isMarked) {
      unmark();
      setMarked(false);
    } else {
      let elements = mark({});
      setElementMap(elements);
      setMarked(true);
    }
  };
  console.log(elementMap);

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
          {elementMap &&
            Object.entries(elementMap).map(([key, value]) => (
              <li key={key}>
                <span>{key}</span>
                <span>{value}</span>
              </li>
            ))}
        </ul>
      </div>
    </main>
  );
}
