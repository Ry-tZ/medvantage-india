---
name: clinical-ui-ux-design
description: >-
  Use this skill when designing, critiquing, or refactoring the UI/UX of the MedVantage
  India Healthcare Career Portal. Incorporates official rules from `anthropics/skills/frontend-design`
  and `vercel-labs/web-interface-guidelines`.
---

# Clinical UI/UX Design & Web Interface Guidelines (`ui-ux-designer`)

> Sourced from [`anthropics/skills/frontend-design`](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) and [`vercel-labs/web-interface-guidelines`](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md).

## 1. Non-Negotiable Founder & Studio Design Rules
1. **NO `% Match` Badges Anywhere**:
   - Never display arbitrary `% Match` or `98% Fit` numbers. Instead, show factual clinical qualification tags (`MD / MS / DNB`, `BDS / MDS`, `B.Sc / GNM`, `1+ Yr Exp`, `Walk-in Interview`, `Direct Apply`).
2. **Multi-Page Deep Navigation (Go Beyond 1 Click)**:
   - Every Job Row and every Application Tile MUST be clickable and navigate to its own **Dedicated Full-Page View** with URL hash routing (`#/job/:id` and `#/application/:id`) and a `← Back` breadcrumb.
   - Users must be able to click any submitted application tile to open its full **Application Dossier Page** (showing the 4-step hiring timeline, submitted cover note, attached clinical profile, interview notes, stage controls, and link to the original job page).
3. **Anthropic `frontend-design` Typography & Structure**:
   - Pair a distinctive editorial serif for major headings (`'Instrument Serif'` or `'Newsreader'`) with a crisp geometric sans-serif (`'Plus Jakarta Sans'` or `'Inter'`) and monospace (`'JetBrains Mono'`) for advertisement numbers, dates, and pay scales.
   - Structural elements (borders, tables, step numbers `01 / 02 / 03` on the multi-step application flow) must encode real sequence and hierarchy.
4. **Vercel `web-interface-guidelines` Accessibility & Polish**:
   - Use `font-variant-numeric: tabular-nums` on all salary, seat roster, and experience columns.
   - Use semantic `<button>` for actions and `<a href="#/...">` for page navigation.
   - Maintain visible `:focus-visible` outlines and clean empty states.
5. **Zero Predefined Profiles on Start**:
   - Never pre-populate fake clinician personas (`Dr. Aarav Sharma`, etc.) on first load.
   - Start with `activeCandidate = null` (or the user's own saved profile from `localStorage` / `/api/profile`). Provide an inline **Quick Clinical Profile Setup Card** and a 1-tap **Create / Update Profile** modal so users enter and update their own Name, Cadre, Degree, Specialty, Experience, and Preferred State.
6. **Distinct Mobile Phone App Shell (`<= 860px`)**:
   - When opened on a mobile phone, render a native-feeling mobile app shell:
     - **Mobile App Header** with brand mark, tap-to-edit **My Profile Pill**, `+ Post`, and `Share`.
     - **Bottom-Sheet Modals & Drawers** (`border-radius: 18px 18px 0 0`) for profile editing, job quick-view, and posting openings.
     - **5-Tab Thumb-Zone Bottom Navigation Bar** (`Eligible`, `Govt/DME`, `Pvt Chains`, `Fellowships`, `Dossiers`) with `env(safe-area-inset-bottom)`.
     - **Touch-Optimized Mobile Cards** (`min-height: 44px` tap targets, `16px` inputs so iOS Safari never auto-zooms).
