# MedVantage India — Healthcare Career, Fellowship & Live Govt/Private Portal (`AGENTS.md`)

> **Mission**: Build India's unified "Workday for Healthcare" career portal and live notification engine for **Allopathic Doctors (MBBS/MD/MS/DM/MCh/DNB)**, **Dental Professionals (BDS/MDS)**, **Nurses (B.Sc/M.Sc Nursing/GNM/Nursing Officers)**, and **Medical/Dental Fellowships**—combining **Live Government & State DME Notifications** with **Direct-Apply Private Hospital Openings**.

---

## 1. Organizational Hierarchy (Active Focus: Engineering Division)

```
                       ┌──────────────────────────────────┐
                       │     Founder / CEO (The User)     │
                       └─────────────────┬────────────────┘
                                         │
                       ┌─────────────────▼────────────────┐
                       │   Chief Operating Orchestrator   │
                       │        (Primary AI Agent)        │
                       └───────┬──────────────────┬───────┘
                               │                  │
        ┌──────────────────────▼──────┐    ┌──────▼──────────────────────┐
        │    ENGINEERING DIVISION     │    │       GROWTH DIVISION       │
        │   (ACTIVE — BUILDING MVP)   │    │     (PAUSED / ON HOLD)      │
        │     Led by: cto-architect   │    │    Led by: cgo-growth-lead  │
        └──────────────┬──────────────┘    └─────────────────────────────┘
                       │
     ┌─────────────────┬─────────────────┬─────────────────┐
     ▼                 ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│gov-scraper-  │  │matching-ai-  │  │ui-ux-        │  │fullstack-    │
│engineer      │  │engineer      │  │designer      │  │portal-dev    │
│(Govt DMEs &  │  │(Doctor/Dental│  │(Minimalist   │  │(Website, ATS,│
│ Pvt Chains)  │  │/Nurse/Fellow │  │ Progressive  │  │ Direct Apply)│
└──────────────┘  │ Recommender) │  │ Disclosure)  │  └──────────────┘
                  └──────────────┘  └──────────────┘
```

---

## 2. Updated Product & Domain Rules (V1 Website Build)

1. **Frictionless Onboarding (No NMC Verification Gate)**:
   - NMC/Council verification is **removed**. Doctors, Dentists, and Nurses can immediately sign in, create their structured clinical profile (Cadre, Degree, Specialty, Years of Experience, Preferred State/City, Role Type), get personalized recommendations, and apply to openings in 1 click.

2. **Four Supported Healthcare Cadres & Tracks**:
   - **Allopathic Doctors**: `MBBS`, `MD`, `MS`, `DNB`, `DM`, `MCh` (MO, Junior Resident, Senior Resident, Registrar, Assistant/Associate/Professor, Specialist & Super-Specialist Consultant).
   - **Dental Professionals**: `BDS`, `MDS` (Dental Surgeon, Dental Officer, Resident, Oral & Maxillofacial / Endodontics / Orthodontics / Prosthodontics Consultant & Faculty).
   - **Nurses & Nursing Officers**: `B.Sc Nursing`, `M.Sc Nursing`, `Post-Basic B.Sc`, `GNM`, `ANM` (Nursing Officer / NORCET, ICU/NICU/OT Staff Nurse, Infection Control Nurse, Nursing Superintendent, Tutor).
   - **Fellowships & Training**: Clinical Fellowships, Post-Doctoral Fellowships (`PDF`), `FNB`, Observerships, and Short-Term Hands-on Fellowships (Critical Care, Arthroplasty, IVF/Reproductive Medicine, GI Endoscopy, Implantology, Aesthetic Dentistry, Onco-Nursing, etc.).

3. **Dual Supply Engine (Live Government/DME Scraper + Big Private Hospital Chains >40–50L Pop Hubs)**:
   - **Live Government & State DME Scraper**: Continuously scrapes and structures notifications from Central Institutes (**AIIMS**, **PGIMER**, **JIPMER**, **NIMHANS**, **ESIC**, **NHM**, **UPSC/AFMS**) AND **State Directorates of Medical Education (State DMEs)** (Maharashtra DMER, Karnataka DME, TN MRB/DME, UP DGME, Delhi, Rajasthan, WBHRB, etc.) for Doctors, Dentists, Nurses, and Fellowships.
   - **Private Hospital Chains Scraper & Direct Portal ("Workday Flow")**: Scrapes and syncs major private hospital chains (**Apollo, Manipal, Fortis, Max, Medanta, Narayana, Aster, KIMS, CARE, Zydus, Shalby, Kauvery, Clove Dental**) across the top 3–5 cities per state / `>40–50 Lakh+` population hubs. Candidates can **1-Click Apply** using their portal profile and track application stages (`Applied` → `Shortlisted` → `Interview` → `Offer`).
   - Employers have an interactive **"Post an Opening / Employer ATS"** portal where hospitals can post vacancies for Doctors, Dentists, Nurses, or Fellowships and review applicants.

4. **Zero Predefined Profiles on Start (User-Owned Profile Creation & Updating)**:
   - There are **NO predefined fake profiles** (`Dr. Aarav Sharma`, etc.) pre-selected when a user opens the portal.
   - Every visitor starts with a clean slate (`activeCandidate = null`, saved per-user in `localStorage` and synced via `POST /api/profile`).
   - Users can immediately browse all live openings OR tap **"Set Up / Update My Profile"** (or use the inline quick-setup card on the home feed) to enter their own Name, Cadre (`DOCTOR`, `DENTAL`, `NURSING`), Degree (`MBBS`, `MD`, `MS`, `DNB`, `DM`, `MCh`, `BDS`, `MDS`, `B.Sc Nursing`, `M.Sc Nursing`, `GNM`), Specialty, Experience, and Preferred State, and update it anytime.

5. **Distinct Mobile Phone App Shell (`<= 860px`) vs. Desktop Workspace (`> 860px`)**:
   - **Desktop (`> 860px`)**: Left 260px Workday/Linear sidebar + sticky top filter header + 4-column tabular rows + right-hand slide-over drawer.
   - **Mobile Phone (`<= 860px`)**: Differently designed mobile-native app shell with:
     - **Mobile App Header**: Brand mark + interactive **"My Profile" Pill** (shows `"Set Up Profile"` on first visit or `"Dr. [Name] · [Degree]"` once saved; tapping opens the bottom-sheet profile editor) + `+ Post` & `Share`.
     - **Inline Mobile Quick-Profile Card**: Shown at the top of the feed when no profile is configured yet so mobile users can set up their qualification in 15 seconds.
     - **Mobile Bottom-Sheet Modals & Drawers** (`border-radius: 18px 18px 0 0`) and **5-Tab Thumb-Zone Bottom Navigation Bar** (`Eligible`, `Govt/DME`, `Pvt Chains`, `Fellowships`, `Dossiers`).

---

## 3. Active Engineering Roster & Linked Skills

| Role ID (Subagent) | Title | Core Responsibility | Linked Skill |
| :--- | :--- | :--- | :--- |
| **`cto-architect`** | Chief Technology Officer | Full-stack system architecture, multi-cadre schema (Doctors, Dental, Nursing, Fellowships), API design, and integration between scraper, matcher, and web UI. | [`medportal-architecture`](.agents/skills/medportal-architecture/SKILL.md) |
| **`gov-scraper-engineer`** | Live Govt/DME & Private Chain Scraper Lead | Live scraping & structured parsing of AIIMS, PGIMER, JIPMER, ESIC, **State DMEs**, and **12 Big Private Hospital Chains** across `>40–50L+` population cities. | [`india-med-gov-scraper`](.agents/skills/india-med-gov-scraper/SKILL.md) |
| **`matching-ai-engineer`** | Multi-Cadre Recommendation Lead | Qualification & experience eligibility engine (without `%` match clutter) tailored for Allopathic Doctors, Dentists (BDS/MDS), Nurses (B.Sc/GNM), and Fellowship seekers. | [`doctor-job-matching`](.agents/skills/doctor-job-matching/SKILL.md) |
| **`ui-ux-designer`** | Principal UI/UX Product Designer | Multi-page routing (`#/job/:id`, `#/application/:id`), Anthropic `frontend-design` + Vercel `web-interface-guidelines` compliance, and zero `% Match` clutter. | [`clinical-ui-ux-design`](.agents/skills/clinical-ui-ux-design/SKILL.md) |
| **`fullstack-portal-dev`** | Lead Full-Stack Website Engineer | End-to-end multi-page web portal implementation partnering with `ui-ux-designer` and `qa-test-engineer`. | [`medportal-fullstack-ui`](.agents/skills/medportal-fullstack-ui/SKILL.md) |
| **`qa-test-engineer`** | QA & E2E Verification Lead | Automated verification of developer work, external URL link reachability checks, multi-page route testing, and end-to-end feature assertions (`backend/qa_verifier.js`). | [`webapp-qa-testing`](.agents/skills/webapp-qa-testing/SKILL.md) |
