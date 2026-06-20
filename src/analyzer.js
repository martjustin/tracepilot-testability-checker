export const MAX_STORY_LENGTH = 4000;
export const MIN_WORD_COUNT = 20;

const vagueTerms = [
  "fast",
  "quick",
  "easy",
  "simple",
  "properly",
  "correctly",
  "user-friendly",
  "intuitive",
  "seamless",
  "robust",
  "as expected",
  "works",
  "better"
];

const negativeSignals = [
  "invalid",
  "error",
  "fail",
  "failure",
  "expired",
  "unauthorized",
  "denied",
  "missing",
  "empty",
  "duplicate",
  "not found",
  "timeout",
  "offline",
  "edge case",
  "negative"
];

const preconditionSignals = [
  "given",
  "when",
  "precondition",
  "before",
  "existing",
  "logged in",
  "authenticated",
  "with an account",
  "has permission",
  "already"
];

const measurableSignals = [
  "display",
  "show",
  "redirect",
  "send",
  "receive",
  "save",
  "update",
  "create",
  "delete",
  "prevent",
  "block",
  "return",
  "status",
  "message",
  "email",
  "toast",
  "within",
  "must",
  "should",
  "then",
  "success",
  "failure"
];

export function countWords(text) {
  return normalizeWhitespace(text).split(/\s+/).filter(Boolean).length;
}

export function normalizeWhitespace(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

export function analyzeStory(rawStory) {
  const story = normalizeWhitespace(rawStory).slice(0, MAX_STORY_LENGTH);
  const lower = story.toLowerCase();
  const words = countWords(story);

  if (words < MIN_WORD_COUNT) {
    return {
      score: 0,
      label: "Poor",
      lowConfidence: true,
      confidenceNote: "The story is too short to score reliably. Add actor, context, acceptance criteria, and expected outcomes.",
      dimensions: buildDimensions({
        actor: 0,
        preconditions: 0,
        acceptance: 0,
        outcomes: 0,
        negative: 0,
        language: 0
      }),
      issues: [
        {
          severity: "Critical",
          title: "Story is below the minimum analysis length",
          evidence: `${words} words`,
          detail: "Add at least 20 words so the checker can evaluate actor, criteria, outcomes, and risk paths."
        }
      ],
      edgeCases: [
        "Add the most likely failure path before asking for generated tests.",
        "State what happens when required data is missing.",
        "State what message, status, or UI change proves the behavior worked."
      ],
      scenarios: []
    };
  }

  const actor = scoreActor(lower);
  const preconditions = scorePreconditions(lower);
  const acceptance = scoreAcceptanceCriteria(story, lower);
  const outcomes = scoreExpectedOutcomes(lower);
  const negative = scoreNegativePaths(lower);
  const language = scoreVagueLanguage(lower);
  const score = actor.score + preconditions.score + acceptance.score + outcomes.score + negative.score + language.score;

  const issues = [
    ...actor.issues,
    ...preconditions.issues,
    ...acceptance.issues,
    ...outcomes.issues,
    ...negative.issues,
    ...language.issues
  ].sort(sortIssues).slice(0, 8);

  const edgeCases = buildEdgeCases(lower).slice(0, 7);
  const scenarios = buildScenarios(story, lower, acceptance.criteria).slice(0, 4);

  return {
    score,
    label: labelForScore(score),
    lowConfidence: false,
    confidenceNote: confidenceFor(score, issues.length),
    dimensions: buildDimensions({
      actor: actor.score,
      preconditions: preconditions.score,
      acceptance: acceptance.score,
      outcomes: outcomes.score,
      negative: negative.score,
      language: language.score
    }),
    issues,
    edgeCases,
    scenarios
  };
}

function scoreActor(lower) {
  const hasAsA = /\bas an?\s+[^,]+/i.test(lower);
  const hasRole = /\b(user|customer|admin|manager|buyer|seller|agent|qa|developer|operator|member|guest|owner|staff|patient|student|teacher)\b/i.test(lower);
  const score = hasAsA ? 15 : hasRole ? 10 : 2;
  return {
    score,
    issues:
      score >= 10
        ? []
        : [
            {
              severity: "Critical",
              title: "Actor or persona is unclear",
              evidence: "No clear role found",
              detail: "State who needs the behavior so scenarios can test permissions, intent, and context."
            }
          ]
  };
}

function scorePreconditions(lower) {
  const hits = preconditionSignals.filter((signal) => lower.includes(signal));
  const score = hits.length >= 2 ? 10 : hits.length === 1 ? 6 : 1;
  return {
    score,
    issues:
      score >= 6
        ? []
        : [
            {
              severity: "Warning",
              title: "Starting conditions are missing",
              evidence: "No precondition phrase detected",
              detail: "Define what must already be true before the test begins, such as account state, permissions, or existing data."
            }
          ]
  };
}

function scoreAcceptanceCriteria(story, lower) {
  const criteria = extractCriteria(story);
  const hasGherkin = /\bgiven\b.+\bwhen\b.+\bthen\b/i.test(lower);
  const criteriaCount = criteria.length;
  const score = Math.min(25, criteriaCount * 7 + (hasGherkin ? 6 : 0) + (lower.includes("acceptance criteria") ? 4 : 0));
  return {
    score,
    criteria,
    issues:
      score >= 17
        ? []
        : [
            {
              severity: "Critical",
              title: "Acceptance criteria are weak or absent",
              evidence: criteriaCount ? `${criteriaCount} likely criterion found` : "No explicit criteria found",
              detail: "Add observable pass/fail conditions before generating regression tests."
            }
          ]
  };
}

function scoreExpectedOutcomes(lower) {
  const hits = measurableSignals.filter((signal) => lower.includes(signal));
  const score = hits.length >= 5 ? 20 : hits.length >= 3 ? 14 : hits.length >= 1 ? 8 : 2;
  return {
    score,
    issues:
      score >= 14
        ? []
        : [
            {
              severity: "Critical",
              title: "Expected outcome is not measurable",
              evidence: hits.length ? `Only ${hits.slice(0, 2).join(", ")} detected` : "No observable result phrase detected",
              detail: "A tester needs a visible state, message, status, redirect, or persisted change to verify."
            }
          ]
  };
}

function scoreNegativePaths(lower) {
  const hits = negativeSignals.filter((signal) => lower.includes(signal));
  const score = hits.length >= 3 ? 15 : hits.length >= 1 ? 9 : 2;
  return {
    score,
    issues:
      score >= 9
        ? []
        : [
            {
              severity: "Warning",
              title: "Negative paths are missing",
              evidence: "No error, invalid, missing, expired, or unauthorized behavior detected",
              detail: "Add at least one failure path so regression coverage does not only prove the happy path."
            }
          ]
  };
}

function scoreVagueLanguage(lower) {
  const found = vagueTerms.filter((term) => new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(lower));
  const score = Math.max(0, 15 - found.length * 5);
  return {
    score,
    issues: found.map((term) => ({
      severity: term === "works" || term === "properly" || term === "correctly" ? "Critical" : "Suggestion",
      title: "Vague language reduces testability",
      evidence: term,
      detail: `Replace "${term}" with a concrete pass/fail condition.`
    }))
  };
}

function extractCriteria(story) {
  const lines = String(story)
    .split(/\r?\n|(?=Given\b)|(?=When\b)|(?=Then\b)/i)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.filter((line) =>
    /^(-|\*|\d+\.|\[ \]|\[x\]|given\b|when\b|then\b|and\b|acceptance criteria|ac:)/i.test(line)
  );
}

function buildEdgeCases(lower) {
  const suggestions = [];
  if (!/\binvalid|wrong|malformed\b/.test(lower)) suggestions.push("User submits invalid or malformed input and receives a specific, recoverable error.");
  if (!/\bempty|missing|required\b/.test(lower)) suggestions.push("Required fields or required source data are missing.");
  if (!/\bunauthorized|permission|role|access\b/.test(lower)) suggestions.push("A user without the required role or permission attempts the action.");
  if (!/\bexpired|timeout|stale\b/.test(lower)) suggestions.push("The request, token, session, or link expires before completion.");
  if (!/\bduplicate|already exists|repeat\b/.test(lower)) suggestions.push("The same action is repeated or submitted twice.");
  if (!/\boffline|network|service unavailable\b/.test(lower)) suggestions.push("The downstream service or network is unavailable.");
  if (!/\bboundary|limit|maximum|minimum\b/.test(lower)) suggestions.push("Input is at the allowed minimum, maximum, and just outside the limit.");
  return suggestions;
}

function buildScenarios(story, lower, criteria) {
  const feature = inferFeature(story);
  const source = criteria.length ? criteria : [story];
  const scenarios = [
    {
      type: "positive",
      title: `Happy path: ${feature} completes with the expected confirmation`,
      mappedTo: summarizeCriterion(source[0])
    },
    {
      type: "negative",
      title: `Negative path: ${feature} blocks invalid or missing required input`,
      mappedTo: summarizeCriterion(source[1] || source[0])
    },
    {
      type: "edge",
      title: `Edge path: ${feature} handles expired, repeated, or boundary-state attempts`,
      mappedTo: summarizeCriterion(source[2] || source[0])
    }
  ];

  if (/\badmin|permission|role|unauthorized|access\b/.test(lower)) {
    scenarios.push({
      type: "negative",
      title: `Permission path: ${feature} rejects users without the required access`,
      mappedTo: summarizeCriterion(source[0])
    });
  } else {
    scenarios.push({
      type: "positive",
      title: `Audit path: ${feature} leaves a visible status or saved state after completion`,
      mappedTo: summarizeCriterion(source[0])
    });
  }

  return scenarios;
}

function inferFeature(story) {
  const normalized = normalizeWhitespace(story);
  const wantMatch = normalized.match(/\bi want to\s+([^,.]+)/i);
  if (wantMatch) return trimBenefitClause(wantMatch[1]).toLowerCase();
  const shouldMatch = normalized.match(/\b(?:system|user|customer|admin)\s+(?:can|should|must)\s+([^,.]+)/i);
  if (shouldMatch) return trimBenefitClause(shouldMatch[1]).toLowerCase();
  return "the requested behavior";
}

function trimBenefitClause(value) {
  return value.split(/\s+so that\s+|\s+in order to\s+|\s+because\s+/i)[0].trim();
}

function summarizeCriterion(text) {
  const clean = normalizeWhitespace(text).replace(/^(-|\*|\d+\.|\[ \]|\[x\]|ac:)/i, "").trim();
  return clean.length > 120 ? `${clean.slice(0, 117)}...` : clean || "Implied acceptance criterion";
}

function buildDimensions(scores) {
  return [
    { key: "actor", label: "Actor clarity", score: scores.actor, max: 15, status: scores.actor >= 10 ? "Clear" : "Unclear" },
    { key: "preconditions", label: "Preconditions", score: scores.preconditions, max: 10, status: scores.preconditions >= 6 ? "Present" : "Missing" },
    { key: "acceptance", label: "Acceptance criteria", score: scores.acceptance, max: 25, status: scores.acceptance >= 17 ? "Strong" : scores.acceptance >= 8 ? "Weak" : "Absent" },
    { key: "outcomes", label: "Expected outcomes", score: scores.outcomes, max: 20, status: scores.outcomes >= 14 ? "Specific" : "Vague" },
    { key: "negative", label: "Negative paths", score: scores.negative, max: 15, status: scores.negative >= 9 ? "Covered" : scores.negative >= 5 ? "Partial" : "Missing" },
    { key: "language", label: "Vague language", score: scores.language, max: 15, status: scores.language >= 12 ? "Clean" : "Flagged" }
  ];
}

function labelForScore(score) {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

function confidenceFor(score, issueCount) {
  if (score >= 80) return "Strong enough for scenario planning. TracePilot Alpha would route this into reviewed regression coverage.";
  if (score >= 60) return "Testable with improvements. Tighten the warnings before generating full Playwright code.";
  if (score >= 40) return "Partially testable. Fix critical gaps before relying on automated coverage.";
  return "Not ready for reliable testing. The story needs clearer criteria before automation.";
}

function sortIssues(a, b) {
  const rank = { Critical: 0, Warning: 1, Suggestion: 2 };
  return rank[a.severity] - rank[b.severity];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function formatReport(story, result) {
  const lines = [
    `TracePilot Story Testability Report`,
    `Score: ${result.score}/100 (${result.label})`,
    ``,
    `Confidence note: ${result.confidenceNote}`,
    ``,
    `Dimensions:`,
    ...result.dimensions.map((dimension) => `- ${dimension.label}: ${dimension.score}/${dimension.max} (${dimension.status})`),
    ``,
    `Quality issues:`,
    ...(result.issues.length
      ? result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.detail} Evidence: ${issue.evidence}.`)
      : [`- No major quality issues detected.`]),
    ``,
    `Suggested edge cases:`,
    ...result.edgeCases.map((edgeCase) => `- ${edgeCase}`),
    ``,
    `Sample Playwright scenario titles:`,
    ...(result.scenarios.length
      ? result.scenarios.map((scenario) => `- [${scenario.type}] ${scenario.title} (maps to: ${scenario.mappedTo})`)
      : [`- Add more story detail before scenario generation.`]),
    ``,
    `Original story:`,
    normalizeWhitespace(story)
  ];
  return lines.join("\n");
}
