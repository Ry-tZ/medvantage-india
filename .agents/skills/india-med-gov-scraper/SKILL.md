---
name: india-med-gov-scraper
description: >-
  Use this skill when building, scheduling, or running web scrapers and parsers
  for Indian Government Medical/Dental/Nursing Colleges, INIs (AIIMS, PGIMER, JIPMER, ESIC, NHM),
  and State DMEs (Directorates of Medical Education) recruitment and fellowship notifications.
---

# Live Indian Government & State DME Notification Scraper (`gov-scraper-engineer`)

## 1. Target Sources Registry (Central + State DMEs)
1. **Central Institutes (INIs & Autonomous)**:
   - All AIIMS (New Delhi, Jodhpur, Rishikesh, Bhopal, Bhubaneswar, Raipur, Patna, Nagpur, Bibinagar, Kalyani, etc.)
   - PGIMER Chandigarh, JIPMER Puducherry, NIMHANS Bengaluru, ESIC Hospitals & Medical/Dental/Nursing Colleges, UPSC CMS, NHM.
2. **State Directorates of Medical Education (State DMEs) & State Recruitment Boards**:
   - **Maharashtra**: DMER Mumbai (`med-edu.in`)
   - **Karnataka**: DME Karnataka (`dme.karnataka.gov.in`)
   - **Tamil Nadu**: TN MRB (`mrb.tn.gov.in`) & TN DME
   - **Uttar Pradesh**: UP DGME (`dgme.up.gov.in`), KGMU, SGPGIMS, RMLIMS
   - **Delhi**: DSSSB, H&FW Delhi, VMMC/Safdarjung, MAMC, LHMC, MAIDS (Dental)
   - **Rajasthan, MP, Gujarat, West Bengal, Kerala, Telangana**: RUHS, MPESB/DME, GMC Gujarat, WBHRB, DME Kerala, DME Telangana.

## 2. Multi-Cadre Classification
Every scraped notification is tagged by:
- **`cadre`**: `DOCTOR` (MBBS/MD/MS/DM/MCh/DNB), `DENTAL` (BDS/MDS), `NURSING` (B.Sc/M.Sc Nursing/GNM/ANM), or `FELLOWSHIP` (Post-PG/Post-BDS/Nursing Fellowships, PDF, FNB).
- **`role_category`**: `Junior Resident`, `Senior Resident`, `Assistant Professor`, `Associate Professor`, `Professor`, `Medical Officer`, `Dental Surgeon`, `Nursing Officer`, `Staff Nurse`, `Clinical Fellow`.
- **`sector`**: `GOVT_CENTRAL` or `GOVT_STATE_DME`.
