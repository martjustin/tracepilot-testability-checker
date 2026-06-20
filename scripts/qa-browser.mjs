import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "../../Helix/node_modules/playwright/index.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const qaDir = fileURLToPath(new URL("../.qa/", import.meta.url));
const baseUrl = process.env.TEST_URL || "http://127.0.0.1:4173";
await mkdir(qaDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await desktop.goto(baseUrl, { waitUntil: "networkidle" });
  await desktop.click("#example-button");
  await desktop.click("#analyze-button");
  await desktop.waitForSelector(".result-panel", { timeout: 5000 });
  const desktopMetrics = await desktop.evaluate(() => ({
    title: document.querySelector("h1")?.textContent,
    score: document.querySelector(".score-value")?.textContent,
    issueCount: document.querySelectorAll(".issue-item").length,
    scenarioCount: document.querySelectorAll(".scenario-item").length,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2
  }));
  await desktop.screenshot({ path: `${qaDir}/desktop.png`, fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 1200 }, isMobile: true });
  await mobile.goto(baseUrl, { waitUntil: "networkidle" });
  await mobile.click("#example-button");
  await mobile.click("#analyze-button");
  await mobile.waitForSelector(".result-panel", { timeout: 5000 });
  const mobileMetrics = await mobile.evaluate(() => ({
    score: document.querySelector(".score-value")?.textContent,
    issueCount: document.querySelectorAll(".issue-item").length,
    scenarioCount: document.querySelectorAll(".scenario-item").length,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2
  }));
  await mobile.screenshot({ path: `${qaDir}/mobile.png`, fullPage: true });

  const result = { desktop: desktopMetrics, mobile: mobileMetrics };
  await writeFile(`${qaDir}/browser-qa.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
