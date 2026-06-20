import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeStory } from "../src/analyzer.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const requiredFiles = ["index.html", "src/main.js", "src/analyzer.js", "src/styles.css", "package.json"];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const html = await readFile(join(root, "index.html"), "utf8");
const css = await readFile(join(root, "src/styles.css"), "utf8");
const js = await readFile(join(root, "src/main.js"), "utf8");
const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));

for (const marker of ["Check testability", "TracePilot QA Alpha", "Join the Alpha waitlist", "Try an example"]) {
  if (!html.includes(marker)) throw new Error(`Missing UI marker: ${marker}`);
}

for (const marker of ["result-compare", "story-map", "score-card", "inline-alpha"]) {
  if (!css.includes(marker)) throw new Error(`Missing CSS marker: ${marker}`);
}

if (!js.includes("navigator.clipboard")) throw new Error("Copy-to-clipboard behavior is missing.");
if (!js.includes("#result=")) throw new Error("Share-link behavior is missing.");
if (!pkg.scripts?.build?.includes("vite build")) throw new Error("Build script must create a Vite production bundle.");
if (!pkg.scripts?.preview?.includes("vite preview")) throw new Error("Preview script must serve the production bundle.");

const result = analyzeStory(`As an admin with billing permissions, I want to refund a paid invoice so that customer support can resolve duplicate charges.
Acceptance criteria:
- Given a paid invoice exists, when I submit a valid refund amount, then the refund is recorded and a success message is displayed.
- Given the refund amount is greater than the paid amount, when I submit it, then the system blocks the refund and displays an error.
- Given a user without billing permission opens the refund action, then the action is not available.`);

if (result.score < 60) throw new Error(`Expected sample story to be testable, got ${result.score}.`);
if (!result.issues.every((issue) => ["Critical", "Warning", "Suggestion"].includes(issue.severity))) {
  throw new Error("Issue severities do not match the PRD contract.");
}

console.log("Static verification passed.");
