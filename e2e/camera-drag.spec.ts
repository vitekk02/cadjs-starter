import { test, expect } from "@playwright/test";
import { loadAppReady, readCameraQuat, quatDelta } from "./helpers";

test("middle-mouse drag rotates the camera", async ({ page }) => {
  await loadAppReady(page);
  const canvas = page.getByTestId("cad-canvas");
  const before = await readCameraQuat(page);

  // OrbitControls is configured with MIDDLE: ROTATE in VisualizerContext
  const box = await canvas.boundingBox();
  if (!box) throw new Error("canvas has no bounding box");
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  await page.mouse.move(cx - 100, cy);
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(cx + 100, cy - 80, { steps: 10 });
  await page.mouse.up({ button: "middle" });

  const after = await readCameraQuat(page);
  expect(quatDelta(before, after)).toBeGreaterThan(0.001);
});
