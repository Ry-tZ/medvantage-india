---
name: webapp-qa-testing
description: >-
  Toolkit and E2E verification workflow for testing the MedVantage India web application.
  Grounded in Anthropic's official `anthropics/skills/skills/webapp-testing/SKILL.md` and
  Vercel's `web-interface-guidelines`. Use this skill to verify developer work, test every
  route/feature, validate that external government & hospital links work, and enforce UI rules.
---

# Web Application QA & Link Verification (`qa-test-engineer`)

> Sourced from [`anthropics/skills/webapp-testing`](https://github.com/anthropics/skills/blob/main/skills/webapp-testing/SKILL.md) and [`vercel-labs/web-interface-guidelines`](https://github.com/vercel-labs/web-interface-guidelines).

## 1. Reconnaissance-Then-Action Verification Protocol
Never assume a developer's feature or link works without running an automated check against the live running server:
1. **Server Lifecycle Check**: Confirm the local server (`http://localhost:3456`) is listening and responds `HTTP 200` on `/` and `/api/bootstrap`.
2. **UI Anti-Regression Checks**:
   - Verify **zero `% Match` / percentage score strings** appear in `public/index.html` or `public/app.js` rendered templates (per Founder rule).
   - Verify **multi-page deep routing** works beyond a single click:
     - Clicking a job row navigates to `#/job/<id>` (full-page job detail + multi-step application flow).
     - Clicking any application tile in "My Applications" or "Hospital HR ATS" navigates to `#/application/<appId>` (full-page application dossier, timeline, notes, stage progression, and withdrawal).
3. **External Link Audit (`source_url` Verification)**:
   - Every government notification (`data/gov_dme_notifications.json`) and private hospital chain opening (`data/private_hospital_jobs.json`) must have a valid `https://` `source_url` that resolves via live HTTP/HTTPS probe or verified domain check.
4. **End-to-End Feature Assertions (`node backend/qa_verifier.js`)**:
   - Test 1: Profile creation & update (`POST /api/profile`) across `DOCTOR`, `DENTAL`, and `NURSING`.
   - Test 2: Recommendation & filtering engine (`POST /api/recommendations`) returns eligible roles with **no `%` match badge**.
   - Test 3: Submitting a job application (`POST /api/apply`) creates a persistent application record and returns its `id`.
   - Test 4: Opening an individual application (`GET /api/applications` / `#/application/:id`) and advancing its stage (`POST /api/applications/status`) or adding notes works end-to-end.
   - Test 5: Posting a new hospital opening (`POST /api/jobs`) immediately surfaces the job in the feed.
