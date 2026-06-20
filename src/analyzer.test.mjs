import assert from "node:assert/strict";
import test from "node:test";
import { analyzeStory, countWords, formatReport, MIN_WORD_COUNT } from "./analyzer.js";

test("declines to score stories under the minimum word count", () => {
  const result = analyzeStory("As a user I want reset password.");
  assert.equal(result.lowConfidence, true);
  assert.equal(result.score, 0);
  assert.equal(result.label, "Poor");
  assert.equal(result.issues[0].severity, "Critical");
});

test("scores detailed stories higher and maps scenarios to criteria", () => {
  const result = analyzeStory(`As a returning customer with an existing account, I want to reset my password so that I can regain access.
Acceptance criteria:
- Given I enter an email for an existing account, when I request a reset, then the system sends a reset email and shows a confirmation message.
- Given I use an expired reset link, when I submit a new password, then the system blocks the reset and shows an error.
- Given the email is not registered, when I request a reset, then the system shows a neutral confirmation message.`);

  assert.equal(result.lowConfidence, false);
  assert.ok(result.score >= 70, `expected >= 70, got ${result.score}`);
  assert.ok(result.scenarios.length >= 3);
  assert.ok(result.scenarios.every((scenario) => ["positive", "negative", "edge"].includes(scenario.type)));
});

test("flags vague language with cited evidence", () => {
  const result = analyzeStory(`As a user with an existing profile, I want the dashboard to work properly and be easy to use so that I can quickly see my account. Acceptance criteria: Given I log in, then the dashboard works correctly and loads fast.`);
  const vagueIssues = result.issues.filter((issue) => issue.title.includes("Vague language"));
  assert.ok(vagueIssues.length >= 2);
  assert.ok(vagueIssues.every((issue) => issue.evidence));
});

test("formats a copyable plain-text report", () => {
  const story = `As a QA lead, I want a story readiness check with acceptance criteria so that I can catch gaps before sprint planning. Given a story is pasted, when it has missing negative paths, then the report shows a warning.`;
  assert.ok(countWords(story) >= MIN_WORD_COUNT);
  const report = formatReport(story, analyzeStory(story));
  assert.match(report, /TracePilot Story Testability Report/);
  assert.match(report, /Dimensions:/);
  assert.match(report, /Suggested edge cases:/);
});
