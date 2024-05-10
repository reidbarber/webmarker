"use client";

import { unmark, mark } from "../../dist/main";
import { useEffect, useState } from "react";

export function Demo() {
  let [isMarked, setMarked] = useState(false);
  let [elementMap, setElementMap] = useState(new Map());

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

  useEffect(() => {
    return () => {
      if (isMarked) {
        unmark();
      }
    };
  }, []);

  return (
    <div>
      <div className="content-center text-center p-8">
        <button
          className="text-white bg-blue-700 w-52 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none dark:focus:ring-blue-900"
          onClick={toggleMark}
        >
          {isMarked ? "Unmark this page" : "Mark this page"}
        </button>
      </div>

      <div className="text-center">{elementMap.size} marked elements</div>
    </div>
  );
}
