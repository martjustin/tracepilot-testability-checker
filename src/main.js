import { analyzeStory, countWords, formatReport, MAX_STORY_LENGTH, MIN_WORD_COUNT } from "./analyzer.js";

const sampleStory = `As a returning customer with an existing account, I want to reset my password so that I can regain access if I forget it.

Acceptance criteria:
- Given I enter the email address for an existing account, when I request a password reset, then the system sends a reset email and shows a confirmation message.
- Given I open a valid reset link, when I submit a new password that meets the password rules, then my password is updated and I can log in with the new password.
- Given the reset link is expired or already used, when I try to submit a new password, then the system blocks the reset and explains how to request a new link.
- Given I enter an email address that is not registered, when I request a reset, then the system shows the same neutral confirmation message without revealing whether the account exists.`;

const state = {
  story: "",
  reports: [],
  loadingTimer: null,
  loadingIndex: 0
};

const messages = ["Reading your story...", "Checking acceptance criteria...", "Looking for edge paths...", "Drafting Playwright scenario titles..."];

const elements = {
  storyInput: document.querySelector("#story-input"),
  count: document.querySelector("#character-count"),
  error: document.querySelector("#input-error"),
  analyze: document.querySelector("#analyze-button"),
  example: document.querySelector("#example-button"),
  clear: document.querySelector("#clear-button"),
  loading: document.querySelector("#loading-state"),
  loadingMessage: document.querySelector("#loading-message"),
  results: document.querySelector("#results-area"),
  template: document.querySelector("#result-template"),
  waitlist: document.querySelector("#waitlist-form"),
  waitlistEmail: document.querySelector("#waitlist-email"),
  waitlistMessage: document.querySelector("#waitlist-message")
};

bootstrap();

function bootstrap() {
  hydrateSharedResult();
  elements.storyInput.addEventListener("input", handleInput);
  elements.analyze.addEventListener("click", runAnalysis);
  elements.example.addEventListener("click", loadExample);
  elements.clear.addEventListener("click", clearStory);
  elements.waitlist.addEventListener("submit", handleWaitlist);
  handleInput();
}

function handleInput() {
  const text = elements.storyInput.value.slice(0, MAX_STORY_LENGTH);
  state.story = text;
  const words = countWords(text);
  elements.count.textContent = `${text.length} / ${MAX_STORY_LENGTH}`;
  elements.analyze.disabled = words < MIN_WORD_COUNT;
  elements.error.textContent = words && words < MIN_WORD_COUNT ? `Add ${MIN_WORD_COUNT - words} more word${MIN_WORD_COUNT - words === 1 ? "" : "s"} to run a reliable check.` : "";
}

function loadExample() {
  elements.storyInput.value = sampleStory;
  handleInput();
  elements.storyInput.focus();
}

function clearStory() {
  elements.storyInput.value = "";
  handleInput();
  elements.storyInput.focus();
}

async function runAnalysis() {
  const story = elements.storyInput.value;
  const words = countWords(story);
  if (words < MIN_WORD_COUNT) {
    elements.error.textContent = "Add more detail before checking testability.";
    return;
  }

  startLoading();
  await delay(650);
  const result = analyzeStory(story);
  stopLoading();
  addReport({ story, result, createdAt: new Date().toISOString() });
}

function addReport(report) {
  state.reports.unshift(report);
  state.reports = state.reports.slice(0, 2);
  renderReports();
  document.querySelector("#results-area")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderReports() {
  elements.results.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = state.reports.length > 1 ? "result-compare" : "single-result";

  state.reports.forEach((report, index) => {
    const node = elements.template.content.firstElementChild.cloneNode(true);
    node.querySelector(".result-kicker").textContent = index === 0 ? "Latest check" : "Previous check";
    node.querySelector(".confidence-note").textContent = report.result.confidenceNote;
    node.querySelector(".score-value").textContent = report.result.score;
    node.querySelector(".score-label").textContent = report.result.label;
    node.dataset.scoreTone = toneFor(report.result.score);
    node.querySelector(".score-bar span").style.width = `${report.result.score}%`;

    const dimensionGrid = node.querySelector(".dimension-grid");
    report.result.dimensions.forEach((dimension) => {
      const item = document.createElement("article");
      item.innerHTML = `
        <div><strong>${dimension.label}</strong><span>${dimension.status}</span></div>
        <div class="mini-bar"><span style="width:${Math.round((dimension.score / dimension.max) * 100)}%"></span></div>
        <small>${dimension.score}/${dimension.max}</small>
      `;
      dimensionGrid.appendChild(item);
    });

    const issuesList = node.querySelector(".issues-list");
    node.querySelector(".issue-count").textContent = `${report.result.issues.length} shown`;
    if (report.result.issues.length) {
      report.result.issues.forEach((issue) => {
        const item = document.createElement("article");
        item.className = "issue-item";
        item.dataset.severity = issue.severity;
        item.innerHTML = `
          <span>${issue.severity}</span>
          <div>
            <strong>${issue.title}</strong>
            <p>${issue.detail}</p>
            <small>Evidence: ${issue.evidence}</small>
          </div>
        `;
        issuesList.appendChild(item);
      });
    } else {
      issuesList.innerHTML = `<p class="empty-state">No major issues detected. This is a good candidate for deeper TracePilot scenario planning.</p>`;
    }

    const edgeList = node.querySelector(".edge-list");
    report.result.edgeCases.forEach((edgeCase) => {
      const item = document.createElement("li");
      item.textContent = edgeCase;
      edgeList.appendChild(item);
    });

    const scenarioList = node.querySelector(".scenario-list");
    if (report.result.scenarios.length) {
      report.result.scenarios.forEach((scenario) => {
        const item = document.createElement("article");
        item.className = "scenario-item";
        item.innerHTML = `
          <span>${scenario.type}</span>
          <strong>${scenario.title}</strong>
          <small>Maps to: ${scenario.mappedTo}</small>
        `;
        scenarioList.appendChild(item);
      });
    } else {
      scenarioList.innerHTML = `<p class="empty-state">Add more detail before generating scenario titles.</p>`;
    }

    node.querySelector(".copy-button").addEventListener("click", () => copyReport(report, node));
    node.querySelector(".share-button").addEventListener("click", () => shareReport(report, node));
    wrapper.appendChild(node);
  });

  elements.results.appendChild(wrapper);
}

async function copyReport(report, node) {
  const message = node.querySelector(".action-message");
  try {
    await navigator.clipboard.writeText(formatReport(report.story, report.result));
    message.textContent = "Copied report.";
  } catch {
    message.textContent = "Clipboard was blocked by the browser.";
  }
}

async function shareReport(report, node) {
  const message = node.querySelector(".action-message");
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify(report))));
  const url = `${location.origin}${location.pathname}#result=${payload}`;
  try {
    await navigator.clipboard.writeText(url);
    message.textContent = "Share link copied.";
  } catch {
    message.textContent = url;
  }
}

function hydrateSharedResult() {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const encoded = hash.get("result");
  if (!encoded) return;
  try {
    const report = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    if (report?.result?.score !== undefined && report?.story) {
      addReport(report);
    }
  } catch {
    // Ignore malformed share links and keep the checker usable.
  }
}

function handleWaitlist(event) {
  event.preventDefault();
  const email = elements.waitlistEmail.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    elements.waitlistMessage.textContent = "Enter a valid email to join the Alpha waitlist.";
    return;
  }

  const signups = JSON.parse(localStorage.getItem("tracepilot_waitlist") || "[]");
  if (!signups.includes(email)) signups.push(email);
  localStorage.setItem("tracepilot_waitlist", JSON.stringify(signups));
  elements.waitlistMessage.textContent = "You are on the Alpha list. The next promise: reviewed coverage, not mystery-generated tests.";
  elements.waitlist.reset();
}

function startLoading() {
  elements.loading.hidden = false;
  elements.analyze.disabled = true;
  state.loadingIndex = 0;
  elements.loadingMessage.textContent = messages[0];
  state.loadingTimer = setInterval(() => {
    state.loadingIndex = (state.loadingIndex + 1) % messages.length;
    elements.loadingMessage.textContent = messages[state.loadingIndex];
  }, 600);
}

function stopLoading() {
  clearInterval(state.loadingTimer);
  elements.loading.hidden = true;
  handleInput();
}

function toneFor(score) {
  if (score < 40) return "poor";
  if (score < 60) return "fair";
  if (score < 80) return "good";
  return "strong";
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
