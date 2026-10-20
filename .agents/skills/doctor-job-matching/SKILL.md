---
name: doctor-job-matching
description: >-
  Use this skill when designing or tuning the recommendation and eligibility matching
  engine for Allopathic Doctors, Dental Professionals, Nurses, and Fellowship seekers
  across Government/State DME notifications and Private Hospital openings.
---

# Multi-Cadre Qualification & Experience Recommendation Engine (`matching-ai-engineer`)

## 1. Cadre & Qualification Progression Matrices

### A. Allopathic Doctors (`DOCTOR`)
- `MBBS` (0–5 yrs): Junior Resident (JR), Medical Officer (MO / GDMO), Duty Doctor, RMO, Clinical Assistant, Post-MBBS Certificate/Fellowship.
- `MD / MS / DNB` (0–3 yrs): Senior Resident (SR), Junior Consultant, Registrar, Post-Doctoral Fellowship (PDF / FNB / Clinical Fellowship), Assistant Professor (after 1 yr SR).
- `MD / MS / DNB` (3–10+ yrs) or `DM / MCh`: Consultant, Senior Consultant, Associate Professor, Professor, HOD, Super-Specialty Fellowship Director.

### B. Dental Professionals (`DENTAL`)
- `BDS` (0–5 yrs): Dental Surgeon, Junior Resident (Dental), Government Dental Officer (State DME/NRHM), Associate Dentist, Aesthetic/Implantology/Endodontic Fellowship.
- `MDS` (0–10+ yrs): Senior Resident (Dental), Assistant/Associate/Professor (Dental College), Specialist Consultant (Oral & Maxillofacial Surgery, Orthodontics, Endodontics, Prosthodontics, Periodontics, Pedodontics), Maxillofacial/Craniofacial Fellowship.

### C. Nurses & Nursing Professionals (`NURSING`)
- `GNM / ANM / B.Sc Nursing` (0–3 yrs): Staff Nurse (ICU, NICU, Emergency, OT, Ward), Nursing Officer (AIIMS NORCET / ESIC / State DME), Clinical Nurse Trainee / Critical Care Nursing Fellowship.
- `B.Sc / Post-Basic / M.Sc Nursing` (3–10+ yrs): Senior Nursing Officer, ICU In-Charge, Infection Control Nurse (ICN), Nurse Educator / Nursing Tutor, Assistant Nursing Superintendent (ANS).

## 2. Composite Recommendation Score ($0 - 100$)
$$\text{MatchScore} = 0.35 \cdot S_{\text{cadre\_degree}} + 0.25 \cdot S_{\text{specialty}} + 0.20 \cdot S_{\text{experience}} + 0.10 \cdot S_{\text{location}} + 0.10 \cdot S_{\text{track\_preference}}$$

- Boosts **Fellowships** when a user toggles *"Interested in Fellowships / Skill Enhancement"* or is within 0–3 years of completing their primary/PG degree.
- Boosts **Govt / State DME** roles or **Private Hospital Direct-Apply** roles according to the user's sector preference, while surfacing top matches from both.
