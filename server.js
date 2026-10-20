/**
 * MedVantage India — Unified Full-Stack Web Server
 * ("Workday for Indian Healthcare": Doctors, Dental, Nursing & Fellowships)
 *
 * Zero external npm dependencies required — runs natively on Node.js v22 HTTP server.
 * Integrates:
 *   - `backend/gov_dme_scraper.py` (Live Central INI & State DME Scraper)
 *   - `backend/matching_engine.js` (Multi-Cadre Qualification & Experience Recommender)
 *   - `data/gov_dme_notifications.json` & `data/private_hospital_jobs.json`
 *   - `data/applications.json` & `data/candidates.json`
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const {
  scoreListingForCandidate,
  getRecommendationsForCandidate,
} = require('./backend/matching_engine');

const PORT = process.env.PORT || 3456;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const GOV_NOTIFICATIONS_FILE = path.join(DATA_DIR, 'gov_dme_notifications.json');
const GOV_STATUS_FILE = path.join(DATA_DIR, 'gov_portal_status.json');
const PRIVATE_JOBS_FILE = path.join(DATA_DIR, 'private_hospital_jobs.json');
const PRIVATE_STATUS_FILE = path.join(DATA_DIR, 'private_scraper_status.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
const CANDIDATES_FILE = path.join(DATA_DIR, 'candidates.json');

// Zero predefined profiles on start — users create and update their own clinical profile
const DEFAULT_CANDIDATES = [];

const QA_REPORT_FILE = path.join(DATA_DIR, 'qa_audit_report.json');

const DEFAULT_APPLICATIONS = [
  {
    id: 'APP-2026-1001',
    job_id: 'PVT-DOC-002',
    job_title: 'Senior Registrar / ICU Registrar — Critical Care Medicine',
    institution: 'Max Super Speciality Hospital, Saket',
    institution_type: 'PRIVATE_HOSPITAL',
    city: 'New Delhi',
    state: 'Delhi',
    pay_scale: '₹1,65,000 / month',
    cadre: 'DOCTOR',
    is_fellowship: false,
    candidate_id: 'cand-doc-md',
    candidate_name: 'Dr. Aarav Sharma',
    candidate_degree: 'MD',
    candidate_specialty: 'General Medicine',
    candidate_experience_years: 1,
    candidate_alma_mater: 'MAMC New Delhi',
    candidate_email: 'aarav.sharma@medvantage.in',
    candidate_phone: '+91 98112 45091',
    candidate_skills: ['ICU Management', 'Mechanical Ventilation', 'Point-of-Care Ultrasound', 'OPD/IPD Care'],
    eligibility_summary: 'Eligible · MD General Medicine · 1+ yr ICU SR',
    notice_period: '15 Days',
    cover_note: 'Completed 1 year of ICU & Internal Medicine SR-ship with hands-on ventilator & central line experience.',
    status: 'Interview Scheduled',
    applied_at: '2026-10-18T14:20:00Z',
    timeline: [
      { stage: 'Applied', timestamp: '2026-10-18T14:20:00Z', actor: 'Dr. Aarav Sharma', detail: 'Submitted structured clinical dossier via 1-Click Direct Apply.' },
      { stage: 'Profile Shortlisted', timestamp: '2026-10-18T17:05:00Z', actor: 'Medical Director Office, Max Saket', detail: 'MD General Medicine & 1 yr SR logbook verified against ICU Registrar criteria.' },
      { stage: 'Interview Scheduled', timestamp: '2026-10-18T19:30:00Z', actor: 'Head of Critical Care, Max Healthcare', detail: 'Clinical panel interaction scheduled (Video / In-person at Saket).' },
    ],
    notes: [
      { id: 'NOTE-1', author: 'Dr. S. Kulkarni (HOD Critical Care)', role: 'Hiring Panel', created_at: '2026-10-18T19:32:00Z', text: 'Strong airway and POCUS logbook from MAMC. Prioritize for 24-bed Medical ICU roster.' },
    ],
  },
  {
    id: 'APP-2026-1002',
    job_id: 'PVT-FEL-019',
    job_title: 'Clinical Fellowship in Full-Mouth Implantology & Digital Laser Dentistry',
    institution: 'Clove Dental (Global Dental Services)',
    institution_type: 'PRIVATE_HOSPITAL',
    city: 'New Delhi',
    state: 'Delhi',
    pay_scale: '₹65,000 / month Stipend',
    cadre: 'DENTAL',
    is_fellowship: true,
    candidate_id: 'cand-dental-mds',
    candidate_name: 'Dr. Priya Nair',
    candidate_degree: 'MDS',
    candidate_specialty: 'Oral & Maxillofacial Surgery',
    candidate_experience_years: 2,
    candidate_alma_mater: 'Govt Dental College Bengaluru',
    candidate_email: 'priya.nair@medvantage.in',
    candidate_phone: '+91 98450 77821',
    candidate_skills: ['Surgical Extractions', 'Dental Implantology', 'Maxillofacial Trauma', 'Rotary Endodontics'],
    eligibility_summary: 'Eligible · MDS Maxillofacial Surgery · 2 yrs Exp',
    notice_period: 'Immediate',
    cover_note: 'Keen to expand guided CBCT implantology & full-mouth rehabilitation logbook.',
    status: 'Profile Shortlisted',
    applied_at: '2026-10-18T16:45:00Z',
    timeline: [
      { stage: 'Applied', timestamp: '2026-10-18T16:45:00Z', actor: 'Dr. Priya Nair', detail: 'Applied with MDS surgical logbook and implant portfolio.' },
      { stage: 'Profile Shortlisted', timestamp: '2026-10-18T18:10:00Z', actor: 'Clove Clinical Fellowship Board', detail: 'Shortlisted for hands-on CBCT planning & surgical case review.' },
    ],
    notes: [
      { id: 'NOTE-2', author: 'Clinical Academic Board', role: 'Fellowship Director', created_at: '2026-10-18T18:15:00Z', text: 'Candidate already has strong surgical extraction background; ready for immediate implant placement track.' },
    ],
  },
];

function readJsonSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    return fallback;
  }
}

function writeJsonSafe(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function normalizeApplicationDossier(app, allListings, candidates) {
  const job = allListings.find((j) => j.id === app.job_id) || {};
  const cand = candidates.find((c) => c.id === app.candidate_id) || {};
  return {
    ...app,
    city: app.city || job.city || job.state || 'India',
    state: app.state || job.state || 'All India',
    pay_scale: app.pay_scale || job.pay_scale || 'As per institutional norms',
    candidate_alma_mater: app.candidate_alma_mater || cand.alma_mater || 'Recognized Medical Institute',
    candidate_email: app.candidate_email || cand.email || 'clinician@medvantage.in',
    candidate_phone: app.candidate_phone || cand.phone || '+91 98000 00000',
    candidate_skills: Array.isArray(app.candidate_skills) && app.candidate_skills.length
      ? app.candidate_skills
      : (cand.skills || ['Clinical Care', 'Patient Management']),
    eligibility_summary:
      app.eligibility_summary ||
      `Eligible · ${app.candidate_degree || 'Verified Degree'} · ${app.candidate_specialty || 'Clinical Track'}`,
    timeline: Array.isArray(app.timeline) && app.timeline.length
      ? app.timeline
      : [
          {
            stage: 'Applied',
            timestamp: app.applied_at || new Date().toISOString(),
            actor: app.candidate_name || 'Candidate',
            detail: 'Submitted structured clinical profile via MedVantage 1-Click Apply.',
          },
          ...(app.status && app.status !== 'Applied'
            ? [
                {
                  stage: app.status,
                  timestamp: new Date().toISOString(),
                  actor: app.institution || 'Hospital Recruitment Cell',
                  detail: `Application advanced to ${app.status}.`,
                },
              ]
            : []),
        ],
    notes: Array.isArray(app.notes) ? app.notes : [],
  };
}

// Ensure seed files exist
readJsonSafe(CANDIDATES_FILE, DEFAULT_CANDIDATES);
readJsonSafe(APPLICATIONS_FILE, DEFAULT_APPLICATIONS);

function getAllListings() {
  const gov = readJsonSafe(GOV_NOTIFICATIONS_FILE, []);
  const pvt = readJsonSafe(PRIVATE_JOBS_FILE, []);
  return [...gov, ...pvt];
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  try {
    // 1. GET /api/bootstrap — Load candidates, listings, portal status, and applications
    if (req.method === 'GET' && pathname === '/api/bootstrap') {
      const candidates = readJsonSafe(CANDIDATES_FILE, DEFAULT_CANDIDATES);
      const govListings = readJsonSafe(GOV_NOTIFICATIONS_FILE, []);
      const privateListings = readJsonSafe(PRIVATE_JOBS_FILE, []);
      const allListings = [...govListings, ...privateListings];
      const portalStatus = readJsonSafe(GOV_STATUS_FILE, {});
      const privatePortalStatus = readJsonSafe(PRIVATE_STATUS_FILE, {});
      const rawApplications = readJsonSafe(APPLICATIONS_FILE, DEFAULT_APPLICATIONS);
      const applications = rawApplications.map((a) =>
        normalizeApplicationDossier(a, allListings, candidates)
      );
      writeJsonSafe(APPLICATIONS_FILE, applications);
      const qaReport = readJsonSafe(QA_REPORT_FILE, null);

      return sendJson(res, 200, {
        candidates,
        govListings,
        privateListings,
        portalStatus,
        privatePortalStatus,
        applications,
        qaReport,
        teamRoster: [
          { id: 'cto-architect', role: 'CTO & System Architect', status: 'Active' },
          { id: 'gov-scraper-engineer', role: 'Live Govt/DME & Private Chain Scraper Lead', status: 'Active' },
          { id: 'matching-ai-engineer', role: 'Multi-Cadre Recommender Lead', status: 'Active' },
          { id: 'ui-ux-designer', role: 'Principal UI/UX Product Designer', status: 'Active' },
          { id: 'fullstack-portal-dev', role: 'Lead Full-Stack Website Engineer', status: 'Active' },
          { id: 'qa-test-engineer', role: 'Lead QA & Link Verification Engineer', status: 'Active' },
        ],
      });
    }

    // 2. POST /api/recommendations — Compute personalized recommendations for any candidate profile (or return all listings if no profile set yet)
    if (req.method === 'POST' && pathname === '/api/recommendations') {
      const body = await parseRequestBody(req);
      const candidate = body.candidate || null;
      const options = body.options || {};
      const allListings = getAllListings();
      if (!candidate || !candidate.degree) {
        const unconfiguredList = allListings.map((item) => ({
          ...item,
          _match: {
            score: 85,
            matchTier: 'ELIGIBLE',
            eligible: true,
            reasons: [
              `Accepted Qualifications: ${(item.degrees_accepted || []).join(', ')}`,
              `Experience Required: ${item.min_experience_years === 0 ? 'Fresher / 0+ yrs' : `${item.min_experience_years}+ yrs`}`,
            ],
          },
        }));
        return sendJson(res, 200, { recommendations: unconfiguredList, hasProfile: false });
      }
      const recommendations = getRecommendationsForCandidate(candidate, allListings, {
        cadreFilter: options.cadreFilter !== false,
        onlyFellowships: Boolean(options.onlyFellowships),
        sector: options.sector || null,
        limit: 100,
      });
      return sendJson(res, 200, { recommendations, hasProfile: true });
    }

    // 3. POST /api/profile — Save or update a candidate profile (No NMC verification required)
    if (req.method === 'POST' && pathname === '/api/profile') {
      const profile = await parseRequestBody(req);
      const candidates = readJsonSafe(CANDIDATES_FILE, DEFAULT_CANDIDATES);
      const id = profile.id || `cand-${Date.now()}`;
      const normalizedProfile = {
        id,
        name: profile.name || 'Dr. Clinician',
        email: profile.email || 'clinician@medvantage.in',
        phone: profile.phone || '+91 98000 00000',
        cadre: String(profile.cadre || 'DOCTOR').toUpperCase(),
        degree: profile.degree || 'MBBS',
        specialty: profile.specialty || 'General Medicine',
        experience_years: Number(profile.experience_years ?? 0),
        age: Number(profile.age ?? 28),
        preferred_state: profile.preferred_state || 'Delhi',
        preferred_city: profile.preferred_city || '',
        interested_in_fellowships: Boolean(profile.interested_in_fellowships),
        preferred_sector: profile.preferred_sector || 'ALL',
        current_role: profile.current_role || `${profile.degree || 'Medical'} Professional`,
        alma_mater: profile.alma_mater || 'Recognized Medical/Dental/Nursing Institute',
        skills: Array.isArray(profile.skills)
          ? profile.skills
          : String(profile.skills || 'Clinical Care, Patient Management')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
      };

      const existingIdx = candidates.findIndex((c) => c.id === id);
      if (existingIdx >= 0) {
        candidates[existingIdx] = normalizedProfile;
      } else {
        candidates.unshift(normalizedProfile);
      }
      writeJsonSafe(CANDIDATES_FILE, candidates);
      return sendJson(res, 200, { profile: normalizedProfile, candidates });
    }

    // 4. POST /api/apply — 1-Click Direct Apply to any Private Hospital / Fellowship or Govt tracker
    if (req.method === 'POST' && pathname === '/api/apply') {
      const body = await parseRequestBody(req);
      const allListings = getAllListings();
      const candidates = readJsonSafe(CANDIDATES_FILE, DEFAULT_CANDIDATES);
      const job = allListings.find((j) => j.id === body.job_id);
      if (!job) {
        return sendJson(res, 404, { error: 'Job or fellowship opening not found' });
      }
      const candidate = body.candidate || {
        id: `cand-${Date.now()}`,
        name: 'Clinician Applicant',
        cadre: job.cadre || 'DOCTOR',
        degree: (job.degrees_accepted && job.degrees_accepted[0]) || 'MBBS',
        specialty: job.specialty || 'General Practice',
        experience_years: job.min_experience_years || 0,
        age: 28,
        preferred_state: job.state || 'Delhi',
        alma_mater: 'Recognized Medical Institute',
      };
      const evaluation = scoreListingForCandidate(candidate, job);
      const applications = readJsonSafe(APPLICATIONS_FILE, DEFAULT_APPLICATIONS).map((a) =>
        normalizeApplicationDossier(a, allListings, candidates)
      );

      const existing = applications.find(
        (a) => a.job_id === job.id && a.candidate_id === candidate.id
      );
      if (existing) {
        return sendJson(res, 200, {
          alreadyApplied: true,
          application: existing,
          applications,
        });
      }

      const nowIso = new Date().toISOString();
      const newApp = normalizeApplicationDossier(
        {
          id: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          job_id: job.id,
          job_title: job.title,
          institution: job.institution,
          institution_type: job.institution_type,
          city: job.city || job.state,
          state: job.state,
          pay_scale: job.pay_scale,
          cadre: job.cadre,
          is_fellowship: Boolean(job.is_fellowship),
          candidate_id: candidate.id,
          candidate_name: candidate.name,
          candidate_degree: candidate.degree,
          candidate_specialty: candidate.specialty,
          candidate_experience_years: candidate.experience_years,
          candidate_alma_mater: candidate.alma_mater,
          candidate_email: candidate.email,
          candidate_phone: candidate.phone,
          candidate_skills: candidate.skills,
          eligibility_summary: (evaluation.reasons || []).slice(0, 2).join(' · ') || `Eligible · ${candidate.degree}`,
          notice_period: body.notice_period || 'Immediate / 15 Days',
          cover_note: body.cover_note || 'Applied via 1-Click MedVantage Clinical Profile.',
          preferred_interview_slot: body.preferred_interview_slot || 'Flexible (Weekday Morning / Afternoon)',
          status: 'Applied',
          applied_at: nowIso,
          timeline: [
            {
              stage: 'Applied',
              timestamp: nowIso,
              actor: candidate.name,
              detail: `Submitted clinical dossier (${candidate.degree} · ${candidate.specialty}) with ${body.notice_period || 'Immediate / 15 Days'} availability.`,
            },
          ],
          notes: [],
        },
        allListings,
        candidates
      );

      applications.unshift(newApp);
      writeJsonSafe(APPLICATIONS_FILE, applications);
      return sendJson(res, 201, { application: newApp, applications });
    }

    // 5. POST /api/applications/status — Employer ATS updates candidate application stage & appends timeline event
    if (req.method === 'POST' && pathname === '/api/applications/status') {
      const body = await parseRequestBody(req);
      const allListings = getAllListings();
      const candidates = readJsonSafe(CANDIDATES_FILE, DEFAULT_CANDIDATES);
      const applications = readJsonSafe(APPLICATIONS_FILE, DEFAULT_APPLICATIONS).map((a) =>
        normalizeApplicationDossier(a, allListings, candidates)
      );
      const app = applications.find((a) => a.id === body.application_id);
      if (!app) {
        return sendJson(res, 404, { error: 'Application not found' });
      }
      const newStatus = body.status || 'Profile Shortlisted';
      app.status = newStatus;
      app.timeline.push({
        stage: newStatus,
        timestamp: new Date().toISOString(),
        actor: body.actor || `${app.institution} Medical HR`,
        detail: body.detail || `Application stage updated to "${newStatus}".`,
      });
      writeJsonSafe(APPLICATIONS_FILE, applications);
      return sendJson(res, 200, { application: app, applications });
    }

    // 5b. POST /api/applications/note — Add an interview or clinical note inside an Application Dossier
    if (req.method === 'POST' && pathname === '/api/applications/note') {
      const body = await parseRequestBody(req);
      const allListings = getAllListings();
      const candidates = readJsonSafe(CANDIDATES_FILE, DEFAULT_CANDIDATES);
      const applications = readJsonSafe(APPLICATIONS_FILE, DEFAULT_APPLICATIONS).map((a) =>
        normalizeApplicationDossier(a, allListings, candidates)
      );
      const app = applications.find((a) => a.id === body.application_id);
      if (!app) {
        return sendJson(res, 404, { error: 'Application not found' });
      }
      const noteText = String(body.text || '').trim();
      if (!noteText) {
        return sendJson(res, 400, { error: 'Note text is required' });
      }
      const note = {
        id: `NOTE-${Date.now()}`,
        author: body.author || app.candidate_name || 'Clinical Reviewer',
        role: body.role || 'Clinical Panel / Candidate Note',
        created_at: new Date().toISOString(),
        text: noteText,
      };
      app.notes.unshift(note);
      writeJsonSafe(APPLICATIONS_FILE, applications);
      return sendJson(res, 200, { application: app, applications });
    }

    // 5c. POST /api/applications/withdraw — Withdraw an application
    if (req.method === 'POST' && pathname === '/api/applications/withdraw') {
      const body = await parseRequestBody(req);
      const allListings = getAllListings();
      const candidates = readJsonSafe(CANDIDATES_FILE, DEFAULT_CANDIDATES);
      const applications = readJsonSafe(APPLICATIONS_FILE, DEFAULT_APPLICATIONS).map((a) =>
        normalizeApplicationDossier(a, allListings, candidates)
      );
      const idx = applications.findIndex((a) => a.id === body.application_id);
      if (idx < 0) {
        return sendJson(res, 404, { error: 'Application not found' });
      }
      const removed = applications.splice(idx, 1)[0];
      writeJsonSafe(APPLICATIONS_FILE, applications);
      return sendJson(res, 200, { withdrawn: removed, applications });
    }

    // 5d. GET /api/qa-report — Live QA & Link Verification Report
    if (req.method === 'GET' && pathname === '/api/qa-report') {
      const report = readJsonSafe(QA_REPORT_FILE, null);
      return sendJson(res, 200, { qaReport: report });
    }

    // 5e. POST /api/qa-run — Trigger Live QA & Link Verification Suite
    if (req.method === 'POST' && pathname === '/api/qa-run') {
      const qaPath = path.join(ROOT_DIR, 'backend', 'qa_verifier.js');
      execFile('node', [qaPath], { timeout: 25000 }, (err, stdout, stderr) => {
        const qaReport = readJsonSafe(QA_REPORT_FILE, null);
        return sendJson(res, 200, {
          ok: !err,
          stdout: String(stdout || '').trim(),
          stderr: String(stderr || '').trim(),
          qaReport,
        });
      });
      return;
    }

    // 6. POST /api/jobs — Employer / Private Hospital posts a new opening (Doctor, Dental, Nurse, or Fellowship)
    if (req.method === 'POST' && pathname === '/api/jobs') {
      const body = await parseRequestBody(req);
      const privateJobs = readJsonSafe(PRIVATE_JOBS_FILE, []);
      const cadre = String(body.cadre || 'DOCTOR').toUpperCase();
      const isFellowship = Boolean(body.is_fellowship);
      const prefix = isFellowship ? 'PVT-FEL' : cadre === 'DENTAL' ? 'PVT-DEN' : cadre === 'NURSING' ? 'PVT-NUR' : 'PVT-DOC';

      const newJob = {
        id: `${prefix}-${Date.now().toString().slice(-4)}`,
        title: body.title || 'Clinical Specialist / Resident Opening',
        institution: body.institution || 'Partner Super Speciality Hospital',
        institution_type: body.institution_type || 'PRIVATE_HOSPITAL',
        state: body.state || 'Maharashtra',
        city: body.city || 'Mumbai',
        cadre,
        is_fellowship: isFellowship,
        role_category: body.role_category || (isFellowship ? 'Clinical Fellowship' : 'Consultant / Specialist'),
        specialty: body.specialty || 'General Medicine',
        degrees_accepted: Array.isArray(body.degrees_accepted)
          ? body.degrees_accepted
          : String(body.degrees_accepted || 'MBBS, MD')
              .split(',')
              .map((d) => d.trim())
              .filter(Boolean),
        min_experience_years: Number(body.min_experience_years ?? 0),
        max_age_years: Number(body.max_age_years ?? 50),
        vacancies_total: Number(body.vacancies_total ?? 4),
        pay_scale: body.pay_scale || `₹${Number(body.monthly_pay_inr || 150000).toLocaleString('en-IN')} / month`,
        monthly_pay_inr: Number(body.monthly_pay_inr || 150000),
        application_mode: '1-Click Direct Apply',
        deadline: body.deadline || '2026-12-31',
        source_url: body.source_url || 'https://www.apollohospitals.com/corporate/careers/',
        highlights: Array.isArray(body.highlights)
          ? body.highlights
          : String(body.highlights || 'Direct 1-Click hospital application; Fast-track interview within 48 hours')
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
        perks: ['1-Click Direct Apply', 'Zero Agency Fee', 'Fast-Track HR Review'],
      };

      privateJobs.unshift(newJob);
      writeJsonSafe(PRIVATE_JOBS_FILE, privateJobs);
      return sendJson(res, 201, { job: newJob, privateListings: privateJobs });
    }

    // 7. POST /api/scrape-gov — Trigger Live Python Central INI & State DME Scraper
    if (req.method === 'POST' && pathname === '/api/scrape-gov') {
      const scraperPath = path.join(ROOT_DIR, 'backend', 'gov_dme_scraper.py');
      execFile('python', [scraperPath], { timeout: 15000 }, (err, stdout, stderr) => {
        const govListings = readJsonSafe(GOV_NOTIFICATIONS_FILE, []);
        const portalStatus = readJsonSafe(GOV_STATUS_FILE, {});
        return sendJson(res, 200, {
          ok: !err,
          stdout: String(stdout || '').trim(),
          stderr: String(stderr || '').trim(),
          govListings,
          portalStatus,
        });
      });
      return;
    }

    // 8. POST /api/scrape-private — Trigger Live Python Private Hospital Chains (>40-50L Pop Cities) Scraper
    if (req.method === 'POST' && pathname === '/api/scrape-private') {
      const pvtScraperPath = path.join(ROOT_DIR, 'backend', 'private_hospital_scraper.py');
      execFile('python', [pvtScraperPath], { timeout: 15000 }, (err, stdout, stderr) => {
        const privateListings = readJsonSafe(PRIVATE_JOBS_FILE, []);
        const privatePortalStatus = readJsonSafe(PRIVATE_STATUS_FILE, {});
        return sendJson(res, 200, {
          ok: !err,
          stdout: String(stdout || '').trim(),
          stderr: String(stderr || '').trim(),
          privateListings,
          privatePortalStatus,
        });
      });
      return;
    }

    // Static file serving from /public
    let safePath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(PUBLIC_DIR, path.normalize(safePath));
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      return fs.createReadStream(filePath).pipe(res);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Internal Server Error' });
  }
});

const os = require('os');

server.listen(PORT, () => {
  console.log(`[MedVantage India Server] Desktop & Mobile Web running at http://localhost:${PORT}`);
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`[MedVantage India Server] Mobile Wi-Fi / LAN URL: http://${net.address}:${PORT}`);
      }
    }
  }
});
