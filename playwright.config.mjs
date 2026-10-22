// Tests run against the local server, or against BASE_URL when it is set,
// for example BASE_URL=https://jhauga.github.io/curl-manpage/ npx playwright test
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://localhost:8000/";

export default defineConfig({
  testDir: "test",
  fullyParallel: true,
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  use: { baseURL, viewport: { width: 1280, height: 800 } },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1280, height: 800 } } },
    { name: "webkit", use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: "node scripts/serve.mjs", url: baseURL, reuseExistingServer: true },
});
