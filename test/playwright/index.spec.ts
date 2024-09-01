import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test("Mark Wikipedia homepage", async ({ page }) => {
  // Navigate to Wikipedia
  await page.goto("https://en.wikipedia.org/wiki/Main_Page");

  // Load the WebMarker library
  const webmarkerJs = fs.readFileSync(
    path.join(__dirname, "../../dist/main.js"),
    "utf8"
  );

  // Inject the WebMarker library into the page
  await page.evaluate(webmarkerJs);

  // Mark the page
  const marks = await page.evaluate(async () => {
    // Use the global WebMarker object
    // @ts-ignore
    return await WebMarker.mark();
  });

  expect(Object.keys(marks).length).toBeGreaterThan(0);

  // Take a screenshot
  await page.screenshot({ path: "wikipedia-marked.png", fullPage: true });

  // Verify that marks have been added
  const markCount = await page.evaluate(
    () => document.querySelectorAll(".webmarker").length
  );
  expect(markCount).toBeGreaterThan(0);
});
