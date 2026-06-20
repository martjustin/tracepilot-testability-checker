# TracePilot Story Testability Checker

Standalone lead magnet for TracePilot QA. It checks whether a pasted user story is ready for reliable test design, then teases the TracePilot Alpha path from strong stories to reviewed Playwright regression coverage.

## Run locally

```bash
npm run dev
```

Open the URL printed by the server. The default is `http://127.0.0.1:4173`, but you can change it:

```bash
$env:PORT="4174"; npm run dev
```

## Verify

```bash
npm run test
npm run build
npm run samples
```

## MVP behavior

- 4,000-character story input with live count.
- Minimum 20-word guard before scoring.
- Strict 0-100 testability scoring.
- Quality issues with Critical, Warning, and Suggestion badges.
- Edge case suggestions.
- Playwright scenario titles, not full code.
- Copy-to-clipboard report.
- Static share links encoded in the URL hash.
- Side-by-side latest and previous results after re-checking.
- Inline TracePilot Alpha waitlist prompt with local-only demo capture.

## Production notes

The current build is dependency-light and uses a deterministic local analyzer so it can be reviewed without external services. A production Next.js version should replace the local analyzer call with `POST /api/analyze`, validate structured model output, add IP-based rate limiting, store shared results by UUID, and send waitlist emails to Supabase, Resend, or Loops.

## Launch review

- [Live readiness review](./docs/live-readiness.md)
- [Sample stories](./docs/sample-stories.md)
- [Positioning notes](./docs/positioning.md)
