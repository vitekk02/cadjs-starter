import { test, expect } from "@playwright/test";
import { loadAppReady, readMode } from "./helpers";

// Known-benign startup messages we tolerate in the smoke suite. Each entry
// is a regression candidate to clean up in a future cleanup session — once
// the underlying call site stops logging, drop the entry from this list.
const TOLERATED_ERRORS = [
  /Scene, camera, or renderer not available/, // useMoveMode.ts:88 — first-render race before visualizer mounts
];

test("app boots cleanly with no unexpected console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (TOLERATED_ERRORS.some((re) => re.test(text))) return;
    errors.push(text);
  });
  page.on("pageerror", (e) => errors.push(e.message));

  await loadAppReady(page);

  await expect(page.getByTestId("feature-tree")).toBeVisible();
  expect(await readMode(page)).toBe("move");
  expect(errors, `unexpected console errors: ${errors.join(" | ")}`).toEqual(
    [],
  );
});
