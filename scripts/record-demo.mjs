// Record the search box in use and save it as a GIF.
// usage: node scripts/record-demo.mjs [--out example-video.gif]
// Needs ffmpeg with the palettegen and paletteuse filters (or set FFMPEG).

import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, rmSync, statSync } from "node:fs";
import { chromium } from "@playwright/test";

const outIndex = process.argv.indexOf("--out");
const out = outIndex > 0 ? process.argv[outIndex + 1] : "example-video.gif";
const ffmpeg = process.env.FFMPEG || "ffmpeg";
const port = 8123;
const workdir = ".tmp/record";

rmSync(workdir, { recursive: true, force: true });
mkdirSync(workdir, { recursive: true });

const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "inherit"],
});
await new Promise((ok) => server.stdout.once("data", ok));

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: workdir, size: { width: 1280, height: 720 } },
});
// Videos do not show the mouse, so draw a dot where it is.
await context.addInitScript(() => {
  addEventListener("DOMContentLoaded", () => {
    const dot = document.createElement("div");
    dot.style.cssText = "position:fixed;z-index:2147483647;width:14px;height:14px;margin:-7px 0 0 -7px;" +
      "border-radius:50%;background:rgba(255,64,64,.75);pointer-events:none;left:-20px;top:-20px";
    document.body.append(dot);
    addEventListener("mousemove", (e) => {
      dot.style.left = e.clientX + "px";
      dot.style.top = e.clientY + "px";
    }, true);
  });
});

const opened = Date.now();
const page = await context.newPage();
const pause = (ms) => page.waitForTimeout(ms);
const center = async (sel) => {
  const b = await page.locator(sel).boundingBox();
  return [b.x + b.width / 2, b.y + b.height / 2];
};
const moveTo = async (sel) => page.mouse.move(...(await center(sel)), { steps: 20 });

await page.goto(`http://localhost:${port}/`);
await page.evaluate(() => window.scrollTo(0, 240));
await page.mouse.move(640, 360);
const start = Date.now();
await pause(700);

await moveTo("#opt-dropdown .dropbtn");
await pause(500);
await moveTo("#optsearch");
await page.mouse.down();
await page.mouse.up();
await page.keyboard.type("proxy", { delay: 120 });
await pause(1200);
await page.keyboard.press("Enter");
await page.mouse.move(700, 400, { steps: 15 });
await pause(1500);

await moveTo("#opt-dropdown .dropbtn");
await pause(400);
await moveTo("#optsearch");
await page.mouse.down();
await page.mouse.up();
await page.keyboard.press("Escape");
await pause(400);
await page.keyboard.type("http3", { delay: 120 });
await pause(1200);
await page.keyboard.press("Escape");
await pause(900);
await page.mouse.move(700, 400, { steps: 15 });
await pause(800);

const video = page.video();
await context.close();
await browser.close();
server.kill();

const webm = await video.path();
// leave out the page load before the demo starts
const skip = ((start - opened) / 1000 + 0.2).toFixed(2);
for (const [fps, width] of [[12, 960], [10, 880], [8, 800]]) {
  const filter = `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];` +
    "[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5";
  const run = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-ss", skip, "-i", webm, "-vf", filter, out],
    { stdio: "inherit" });
  if (run.status !== 0) {
    console.error(`${ffmpeg} failed (${run.error?.message ?? run.status})`);
    process.exit(1);
  }
  const mb = statSync(out).size / 1e6;
  console.log(`${out}: ${mb.toFixed(2)} MB at ${fps} fps, ${width}px wide`);
  if (mb <= 5) break;
}
rmSync(workdir, { recursive: true, force: true });
