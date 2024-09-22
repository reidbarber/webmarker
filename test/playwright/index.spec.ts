import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test("Demo app visual regression test", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot();

  // Load the WebMarker library
  const webmarkerJs = fs.readFileSync(
    path.join(__dirname, "../../dist/main.js"),
    "utf8"
  );

  // Inject the WebMarker library into the page
  await page.evaluate(webmarkerJs);

  // Mark the page
  await page.evaluate(() => {
    // Use the global WebMarker object
    // @ts-ignore
    return WebMarker.mark();
  });

  await expect(page).toHaveScreenshot();

  await page.evaluate(() => {
    // Use the global WebMarker object
    // @ts-ignore
    return WebMarker.unmark();
  });

  await expect(page).toHaveScreenshot();
});
