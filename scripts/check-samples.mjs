import { analyzeStory } from "../src/analyzer.js";
import { sampleStories } from "../src/sample-stories.js";

const bandRank = { Poor: 0, Fair: 1, Good: 2, Strong: 3 };
const rows = sampleStories.map((sample) => {
  const result = analyzeStory(sample.story);
  return {
    id: sample.id,
    expected: sample.expectedBand,
    actual: result.label,
    score: result.score,
    issues: result.issues.length,
    scenarios: result.scenarios.length
  };
});

for (const row of rows) {
  if (bandRank[row.actual] !== bandRank[row.expected]) {
    throw new Error(`${row.id} expected ${row.expected}, got ${row.actual} (${row.score}).`);
  }
}

console.table(rows);
