"use client";

import { unmark, mark } from "webmarker-js";
import { useEffect, useState } from "react";

export function Demo() {
  let [markedElements, setMarkedElements] = useState({});
  const isMarked = Object.keys(markedElements).length > 0;

  let toggleMark = () => {
    if (isMarked) {
      unmark();
      setMarkedElements({});
    } else {
      let elements = mark({});
      setMarkedElements(elements);
    }
  };

  useEffect(() => {
    return () => {
      unmark();
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

      <div className="text-center">
        {Object.keys(markedElements).length} marked elements
      </div>
    </div>
  );
}
