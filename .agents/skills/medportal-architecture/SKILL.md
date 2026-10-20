---
name: medportal-architecture
description: >-
  Use this skill when designing or modifying the system architecture, database schema,
  or API contracts for the MedVantage India Healthcare Career Portal (Allopathic Doctors,
  Dental, Nursing, Fellowships, Live Govt/State DME Notifications, and Private Hospital Direct Apply).
---

# MedPortal System Architecture & Data Schema (`cto-architect`)

## 1. Core Architectural Pillars
1. **Frictionless Multi-Cadre Account & Profile System (No NMC Verification Gate)**:
   - Supports **Allopathic Doctors (`DOCTOR`)**, **Dental Professionals (`DENTAL`)**, and **Nurses (`NURSING`)**.
   - Candidates sign in, set their qualification, specialty, experience years, preferred states, and whether they are looking for **Full-Time Clinical/Faculty Roles**, **Govt/DME Posts**, or **Fellowships**.
2. **Dual Job & Fellowship Engine**:
   - **Live Government & State DME Feed**: Scraped and structured openings from AIIMS, PGIMER, JIPMER, ESIC, NHM, and State DMEs (DMER Maharashtra, Karnataka DME, UP DGME, TN MRB, Delhi Health, etc.).
   - **Private Hospital & Institute Direct-Apply ATS**: Private hospital chains, nursing homes, dental chains, and medical colleges post openings for Doctors, Dentists, Nurses, and Fellowships. Candidates apply directly in 1 click and track their application status (`Applied`, `Under Review`, `Interview Scheduled`, `Selected`).
3. **Qualification & Experience Recommendation Engine**:
   - Ranks both Government/DME and Private Hospital jobs + Fellowships using cadre, degree hierarchy, specialty, experience years, age eligibility, and location preferences.
