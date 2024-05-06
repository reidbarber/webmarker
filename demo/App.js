import { unmark, mark } from "../src";
import { useEffect, useState } from "react";

export function App() {
  let [isMarked, setMarked] = useState(false);
  let [elementMap, setElementMap] = useState(null);

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
      mark({});
      setMarked(true);
    }
  };

  return (
    <main>
      <h1>WebMarker Demo</h1>
      <button onClick={toggleMark}>{isMarked ? "Unmark" : "Mark"}</button>
      <div>
        <label htmlFor="field-1">Input:</label>
        <input id="field-1" type="text" />
      </div>
    </main>
  );
}
