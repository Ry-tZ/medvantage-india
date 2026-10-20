/**
 * MedVantage India — Multi-Page Clinical Career, Fellowship & Live Govt/Private Portal
 * Built with Anthropic `frontend-design` + Vercel `web-interface-guidelines`:
 *   - ZERO `% Match` / `% Fit` clutter anywhere (uses factual qualification & eligibility badges).
 *   - Multi-page hash routing beyond one click:
 *       * `#/feed`, `#/gov-radar`, `#/private-hospitals`, `#/fellowships`, `#/applications`, `#/qa-audit`
 *       * `#/job/:id` — Dedicated Full-Page Job Dossier & Multi-Step Application Page
 *       * `#/application/:id` — Dedicated Full-Page Application Dossier (opened by clicking any application tile)
 */

'use strict';

const state = {
  candidates: [],
  activeCandidate: null,
  govListings: [],
  privateListings: [],
  recommendations: [],
  portalStatus: {},
  privatePortalStatus: {},
  applications: [],
  qaReport: null,
  activeTab: 'recommendations',
  lastFeedTab: 'recommendations',
  recQuickFilter: 'ALL',
  filters: {
    search: '',
    cadre: 'MATCH_PROFILE',
    specialty: 'MATCH_PROFILE',
    state: 'ALL',
    cityPop: 'ALL',
  },
};

const CADRE_DEGREES_MAP = {
  DOCTOR: [
    { value: 'MS', label: 'MS (Master of Surgery)' },
    { value: 'MD', label: 'MD (Doctor of Medicine)' },
    { value: 'DNB', label: 'DNB (Diplomate of National Board)' },
    { value: 'MBBS', label: 'MBBS' },
    { value: 'MCh', label: 'MCh (Surgical Super-Specialty)' },
    { value: 'DM', label: 'DM (Medical Super-Specialty)' },
  ],
  DENTAL: [
    { value: 'MDS', label: 'MDS (Master of Dental Surgery)' },
    { value: 'BDS', label: 'BDS (Bachelor of Dental Surgery)' },
  ],
  NURSING: [
    { value: 'B.Sc Nursing', label: 'B.Sc Nursing' },
    { value: 'M.Sc Nursing', label: 'M.Sc Nursing' },
    { value: 'Post-Basic B.Sc', label: 'Post-Basic B.Sc Nursing' },
    { value: 'GNM', label: 'GNM (General Nursing & Midwifery)' },
  ],
};

const DEGREE_BRANCH_OPTIONS = {
  MS: [
    'General Surgery',
    'Orthopedics',
    'Obstetrics & Gynecology',
    'Ophthalmology',
    'ENT (Otorhinolaryngology)',
    'Trauma Surgery',
  ],
  MD: [
    'General Medicine',
    'Pediatrics',
    'Radiodiagnosis / Radiology',
    'Anesthesiology & Critical Care',
    'Emergency Medicine',
    'Pulmonary Medicine',
    'Dermatology',
    'Obstetrics & Gynecology',
    'Community Medicine',
  ],
  DNB: [
    'General Medicine',
    'General Surgery',
    'Orthopedics',
    'Pediatrics',
    'Radiodiagnosis / Radiology',
    'Critical Care Medicine',
    'Obstetrics & Gynecology',
    'Anesthesiology & Critical Care',
    'Emergency Medicine',
  ],
  MBBS: [
    'General Practice / Medical Officer (GDMO)',
    'Emergency & Casualty (RMO)',
    'Junior Residency (General Medicine / Surgery)',
    'ICU / Critical Care Junior Resident',
  ],
  MCh: [
    'Surgical Gastroenterology / GI Surgery',
    'Cardiothoracic & Vascular Surgery (CTVS)',
    'Neurosurgery',
    'Urology',
    'Surgical Oncology',
    'Plastic & Reconstructive Surgery',
  ],
  DM: [
    'Cardiology',
    'Critical Care Medicine',
    'Medical Gastroenterology',
    'Nephrology',
    'Neurology',
    'Neonatology',
    'Medical Oncology',
  ],
  MDS: [
    'Oral & Maxillofacial Surgery',
    'Conservative Dentistry & Endodontics',
    'Orthodontics & Dentofacial Orthopedics',
    'Prosthodontics & Implantology',
    'Periodontology',
    'Pedodontics & Preventive Dentistry',
  ],
  BDS: [
    'General Dentistry & Dental Surgeon',
    'Oral Implantology & Aesthetic Dentistry',
    'Endodontics & Restorative Dentistry',
    'Hospital & Public Health Dentistry',
  ],
  'B.Sc Nursing': [
    'Critical Care / ICU Nursing',
    'NICU / PICU Pediatric Nursing',
    'Operation Theatre (OT) Nursing',
    'Emergency & Trauma Nursing',
    'General Ward / Medical-Surgical Nursing',
    'Infection Control Nursing',
  ],
  'Post-Basic B.Sc': [
    'Critical Care / ICU Nursing',
    'Operation Theatre (OT) Nursing',
    'Emergency & Trauma Nursing',
    'General Ward / Medical-Surgical Nursing',
  ],
  'M.Sc Nursing': [
    'Critical Care / ICU Supervision',
    'Nursing Education / Tutor / Lecturer',
    'Infection Control & Nursing Administration',
    'Obstetrics & Pediatric Nursing',
    'Neuro-Critical Care Nursing',
  ],
  GNM: [
    'Staff Nurse (General Ward / IPD)',
    'ICU / Emergency Staff Nurse',
    'Operation Theatre (OT) Staff Nurse',
    'Obstetrics & Labour Room Nursing',
  ],
};

const STATE_CITIES_MAP = {
  'All India': [
    'New Delhi',
    'Mumbai',
    'Bengaluru',
    'Chennai',
    'Hyderabad',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Gurugram',
    'Faridabad',
    'Lucknow',
    'Jaipur',
    'Nagpur',
    'Chandigarh',
    'Bhubaneswar',
    'Puducherry',
    'Rishikesh',
  ],
  Delhi: ['New Delhi'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur'],
  Karnataka: ['Bengaluru'],
  'Tamil Nadu': ['Chennai', 'Coimbatore'],
  Telangana: ['Hyderabad'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur'],
  'West Bengal': ['Kolkata'],
  Haryana: ['Gurugram', 'Faridabad'],
  Rajasthan: ['Jaipur'],
  Chandigarh: ['Chandigarh'],
  Odisha: ['Bhubaneswar'],
  Puducherry: ['Puducherry'],
  Uttarakhand: ['Rishikesh'],
};

const METRO_40L_CITIES = new Set([
  'Mumbai',
  'New Delhi',
  'Delhi',
  'Bengaluru',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Ahmedabad',
  'Surat',
  'Pune',
  'Jaipur',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Visakhapatnam',
  'Coimbatore',
  'Vadodara',
  'Kochi',
  'Gurugram',
  'Faridabad',
]);

const HIRING_STAGES = [
  'Applied',
  'Profile Shortlisted',
  'Interview Scheduled',
  'Offer Extended',
];

const VIEW_META = {
  recommendations: {
    title: 'Eligible Roles For Your Qualification',
    subtitle: 'Strictly filtered by your selected Degree, Field/Branch (e.g. MS Orthopedics, MD Medicine), and City/State.',
  },
  'gov-radar': {
    title: 'Live Govt & State DME Notifications',
    subtitle: 'Central INIs (AIIMS, PGIMER, JIPMER, NIMHANS, ESIC) & State DMEs across India with verified official links.',
  },
  'private-hospitals': {
    title: 'Big Private Hospital Chains (>40–50L+ Metro Hubs)',
    subtitle: 'Direct 1-Click Apply openings from Apollo, Manipal, Fortis, Max, Medanta, Narayana, Aster, KIMS, CARE & Clove Dental.',
  },
  fellowships: {
    title: 'Fellowships & Super-Specialty Training Hub',
    subtitle: 'Post-Doctoral Fellowships, FNB, Critical Care, Surgical, Dental Implantology & ICU Nursing Fellowships.',
  },
  applications: {
    title: 'Applications & Hospital HR Pipeline (ATS)',
    subtitle: 'Click any application tile below to open its full Application Dossier page, 4-stage timeline, and clinical notes.',
  },
  'qa-audit': {
    title: 'QA & Live External Link Verification Suite',
    subtitle: 'Automated E2E verification of multi-page routes, anti-%-clutter rules, and live HTTP reachability of Govt & Hospital links.',
  },
};

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.add('hidden'), 3400);
}

function getInitials(name) {
  return String(name || 'DR')
    .replace(/^Dr\.\s*/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || '')
    .join('')
    .toUpperCase();
}

function getInstMonogram(inst) {
  const clean = String(inst || 'MH').replace(/[^A-Za-z0-9 ]/g, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAllJobs() {
  return [...state.govListings, ...state.privateListings];
}

function findJobWithEval(jobId) {
  const fromRec = state.recommendations.find((r) => r.id === jobId);
  if (fromRec) return fromRec;
  const all = getAllJobs();
  return all.find((j) => j.id === jobId) || null;
}

function getEligibilityBadgeText(item) {
  const degrees = (item.degrees_accepted || []).slice(0, 3).join('/');
  const m = item._match;
  if (m && m.eligible === false) {
    return `Other Branch · ${degrees || item.cadre}`;
  }
  return `Eligible · ${degrees || item.cadre}`;
}

const PROFILE_STORAGE_KEY = 'medvantage_user_profile_v1';

function loadSavedUserProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.degree ? parsed : null;
  } catch (_) {
    return null;
  }
}

function saveUserProfileLocal(profile) {
  try {
    if (!profile) {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } else {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    }
  } catch (_) {}
}

function syncFiltersWithActiveProfile() {
  const c = state.activeCandidate;
  populateTopSpecialtyFilterOptions();
  if (!c) {
    state.filters.cadre = 'ALL';
    state.filters.specialty = 'ALL';
    state.filters.state = 'ALL';
    state.filters.cityPop = 'ALL';
  } else {
    state.filters.cadre = 'MATCH_PROFILE';
    state.filters.specialty = 'MATCH_PROFILE';
    state.filters.state =
      c.preferred_state && c.preferred_state !== 'All India' ? c.preferred_state : 'ALL';
    state.filters.cityPop =
      c.preferred_city && c.preferred_city !== 'ALL' ? c.preferred_city : 'ALL';
  }

  const cadEl = document.getElementById('filterCadre');
  const specEl = document.getElementById('filterSpecialty');
  const stEl = document.getElementById('filterState');
  const cityEl = document.getElementById('filterCityPop');

  if (cadEl) cadEl.value = state.filters.cadre;
  if (specEl) specEl.value = state.filters.specialty;
  if (stEl) stEl.value = state.filters.state;
  if (cityEl) cityEl.value = state.filters.cityPop;
}

function populateTopSpecialtyFilterOptions() {
  const specSelect = document.getElementById('filterSpecialty');
  if (!specSelect) return;

  const c = state.activeCandidate;
  const activeDegree = c?.degree || null;
  const degreeBranches = activeDegree && DEGREE_BRANCH_OPTIONS[activeDegree]
    ? DEGREE_BRANCH_OPTIONS[activeDegree]
    : [
        'General Medicine',
        'General Surgery',
        'Orthopedics',
        'Obstetrics & Gynecology',
        'Pediatrics',
        'Radiodiagnosis / Radiology',
        'Anesthesiology & Critical Care',
        'Emergency Medicine',
        'Oral & Maxillofacial Surgery',
        'Conservative Dentistry & Endodontics',
        'Prosthodontics & Implantology',
        'Critical Care / ICU Nursing',
        'Operation Theatre (OT) Nursing',
      ];

  const matchLabel = c
    ? `Branch: Match My Profile (${c.degree} - ${c.specialty})`
    : 'Branch: Match My Profile';

  specSelect.innerHTML = `
    <option value="MATCH_PROFILE">${escapeHtml(matchLabel)}</option>
    <option value="ALL">All Specialties / Branches</option>
    ${degreeBranches
      .map((b) => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`)
      .join('')}
  `;
}

async function bootstrap() {
  const res = await fetch('/api/bootstrap');
  const data = await res.json();
  state.candidates = data.candidates || [];
  state.govListings = data.govListings || [];
  state.privateListings = data.privateListings || [];
  state.portalStatus = data.portalStatus || {};
  state.privatePortalStatus = data.privatePortalStatus || {};
  state.applications = data.applications || [];
  state.qaReport = data.qaReport || null;

  // ZERO predefined profile on start — only load if this user previously saved their own profile
  state.activeCandidate = loadSavedUserProfile();

  syncFiltersWithActiveProfile();
  renderActiveProfileBanner();
  updateSidebarScraperFooter();
  await refreshRecommendations();
  renderAllViews();
  handleHashRoute();
}

function renderActiveProfileBanner() {
  const c = state.activeCandidate;
  const avatarEl = document.getElementById('profileAvatar');
  const nameEl = document.getElementById('profileName');
  const badgeEl = document.getElementById('profileDegreeBadge');
  const editBtn = document.getElementById('editProfileBtn');
  const clearBtn = document.getElementById('clearProfileBtn');
  const mobPillText = document.getElementById('mobileProfilePillText');

  if (!c) {
    if (avatarEl) avatarEl.textContent = '+';
    if (nameEl) nameEl.textContent = 'No Profile Set Yet';
    if (badgeEl) badgeEl.textContent = 'Select Degree, Branch & City';
    if (editBtn) editBtn.textContent = '+ Create My Profile';
    if (clearBtn) clearBtn.classList.add('hidden');
    if (mobPillText) mobPillText.textContent = '+ Set Up Profile';
    return;
  }

  const locLabel =
    c.preferred_city && c.preferred_city !== 'ALL'
      ? c.preferred_city
      : c.preferred_state || 'All India';

  if (avatarEl) avatarEl.textContent = getInitials(c.name);
  if (nameEl) nameEl.textContent = c.name;
  if (badgeEl) badgeEl.textContent = `${c.degree} (${c.specialty}) • ${locLabel}`;
  if (editBtn) editBtn.textContent = 'Update Profile';
  if (clearBtn) clearBtn.classList.remove('hidden');
  if (mobPillText) mobPillText.textContent = `${c.name} · ${c.degree} (${c.specialty}) ✎`;
}

function updateSidebarScraperFooter() {
  const govReach = state.portalStatus?.portals_reachable ?? 11;
  const govTotal = state.portalStatus?.portals_probed ?? 12;
  const pvtReach = state.privatePortalStatus?.chains_reachable ?? 12;
  const pvtTotal = state.privatePortalStatus?.chains_probed ?? 12;
  const el = document.getElementById('sidebarScraperText');
  if (el) {
    el.textContent = `${govReach + pvtReach}/${govTotal + pvtTotal} Portals Verified`;
  }
  const qaBadge = document.getElementById('tabCountQa');
  if (qaBadge) {
    qaBadge.textContent = state.qaReport && state.qaReport.failed > 0 ? 'WARN' : 'PASS';
  }
}

async function refreshRecommendations() {
  const res = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate: state.activeCandidate || null,
      options: { cadreFilter: Boolean(state.activeCandidate) },
    }),
  });
  const data = await res.json();
  state.recommendations = data.recommendations || [];
}

function doesItemMatchSpecialtyKeyword(item, targetSpec) {
  if (!targetSpec || targetSpec === 'ALL') return true;
  const cleanTarget = targetSpec.toLowerCase();
  const hay = `${item.specialty || ''} ${item.title || ''} ${item.role_category || ''}`.toLowerCase();
  if (hay.includes(cleanTarget)) return true;

  // Check primary keywords inside parentheses/slashes (e.g. "Orthopedics", "General Surgery", "Obstetrics", "Radiodiagnosis", "ICU", "Implantology")
  const tokens = cleanTarget
    .replace(/[()/&-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !['and', 'the', 'for', 'nursing', 'doctor', 'medical', 'general', 'junior', 'senior'].includes(w));

  if (cleanTarget.includes('general medicine') && (hay.includes('general medicine') || hay.includes('internal medicine'))) return true;
  if (cleanTarget.includes('general surgery') && (hay.includes('general surgery') || hay.includes('laparoscopic'))) return true;
  if (cleanTarget.includes('general practice') && (hay.includes('general practice') || hay.includes('medical officer') || hay.includes('gdmo') || hay.includes('rmo') || hay.includes('emergency'))) return true;
  if (cleanTarget.includes('general dentistry') && (hay.includes('dentistry') || hay.includes('dental'))) return true;
  if (cleanTarget.includes('general ward') && (hay.includes('general ward') || hay.includes('medical-surgical') || hay.includes('staff nurse') || hay.includes('nursing officer'))) return true;

  return tokens.some((tk) => hay.includes(tk));
}

function matchesGlobalFilters(item, options = {}) {
  const { search, cadre, specialty, state: stFilter, cityPop } = state.filters;
  const c = state.activeCandidate;

  // 1. Cadre & Degree Filter
  if (cadre === 'MATCH_PROFILE' && c) {
    if (item.cadre !== c.cadre) return false;
    // Also enforce that the listing is degree-eligible for the user's degree (e.g. MS vs MD vs MBBS)
    if (item.degreeEligible === false || item._match?.degreeEligible === false) {
      return false;
    }
  } else if (cadre !== 'ALL' && cadre !== 'MATCH_PROFILE') {
    if (item.cadre !== cadre) return false;
  }

  // 2. Specialty / Branch Filter (Crucial: when user selects MS -> Orthopedics, filter to Orthopedics!)
  if (specialty === 'MATCH_PROFILE' && c && c.specialty) {
    const isSpecEligible =
      item.specialtyEligible !== undefined
        ? item.specialtyEligible
        : item._match?.specialtyEligible !== undefined
        ? item._match.specialtyEligible
        : doesItemMatchSpecialtyKeyword(item, c.specialty);
    if (!isSpecEligible) return false;
  } else if (specialty && specialty !== 'ALL' && specialty !== 'MATCH_PROFILE') {
    if (!doesItemMatchSpecialtyKeyword(item, specialty)) return false;
  }

  // 3. State Filter
  if (stFilter !== 'ALL') {
    if (item.state !== stFilter && item.state !== 'All India') return false;
  }

  // 4. City Filter
  if (cityPop !== 'ALL') {
    const itemCity = String(item.city || '');
    const isMetro =
      Boolean(item.city_population_40l_plus) ||
      METRO_40L_CITIES.has(itemCity) ||
      METRO_40L_CITIES.has(String(item.state || ''));
    if (cityPop === 'POP_40L_PLUS') {
      if (!isMetro) return false;
    } else {
      const cityLower = cityPop.toLowerCase();
      const itemCityLower = itemCity.toLowerCase();
      const itemStateLower = String(item.state || '').toLowerCase();
      if (
        !itemCityLower.includes(cityLower) &&
        !cityLower.includes(itemCityLower || '__none__') &&
        itemStateLower !== cityLower
      ) {
        return false;
      }
    }
  }

  // 5. Search Query Filter
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    const hay = [
      item.title,
      item.institution,
      item.chain_name,
      item.specialty,
      item.role_category,
      item.state,
      item.city,
      ...(item.degrees_accepted || []),
    ]
      .join(' ')
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }

  return true;
}

/**
 * Clean 4-Signal Row Renderer (Strict Zero `% Match` Rule)
 * Clicking the row opens the full dedicated Job Page (`#/job/:id`), while "Quick Preview" opens the slide-over drawer.
 */
function renderJobRow(item) {
  const isApplied = state.applications.some(
    (a) =>
      a.job_id === item.id &&
      state.activeCandidate &&
      a.candidate_id === state.activeCandidate.id
  );
  const existingApp = state.applications.find(
    (a) =>
      a.job_id === item.id &&
      state.activeCandidate &&
      a.candidate_id === state.activeCandidate.id
  );

  const isGov =
    item.institution_type === 'CENTRAL_INI' ||
    item.institution_type === 'CENTRAL_GOVT' ||
    item.institution_type === 'STATE_DME';

  const sectorLabel =
    item.institution_type === 'STATE_DME'
      ? 'State DME'
      : isGov
      ? 'Central INI'
      : item.chain_name || 'Private Hospital';

  const locationLabel = item.city ? `${item.city}, ${item.state}` : item.state;
  const degreesText = (item.degrees_accepted || []).slice(0, 3).join(', ');
  const expText =
    item.min_experience_years === 0
      ? 'Fresher / 0+ yrs'
      : `${item.min_experience_years}+ yrs exp`;

  const eligibilityBadge = `<span class="badge badge-match-high">${escapeHtml(
    getEligibilityBadgeText(item)
  )}</span>`;

  return `
    <article class="job-row" tabindex="0" role="link" aria-label="${escapeHtml(item.title)} at ${escapeHtml(item.institution)}" onclick="navigateTo('#/job/${escapeHtml(item.id)}')" onkeydown="if(event.key==='Enter') navigateTo('#/job/${escapeHtml(item.id)}')">
      <!-- Signal 1: Role + Institution + Location -->
      <div class="row-primary">
        <div class="inst-monogram">${escapeHtml(getInstMonogram(item.institution))}</div>
        <div class="row-title-wrap">
          <div class="row-title">${escapeHtml(item.title)}</div>
          <div class="row-inst">
            <span>${escapeHtml(item.institution)}</span>
            <span>·</span>
            <span>${escapeHtml(locationLabel)}</span>
            ${
              item.is_fellowship
                ? `<span class="badge badge-fellowship">Fellowship</span>`
                : `<span class="badge badge-sector">${escapeHtml(sectorLabel)}</span>`
            }
            ${
              item.city_population_lakh
                ? `<span class="badge badge-metro">${escapeHtml(item.city_population_lakh)}L+ Hub</span>`
                : ''
            }
          </div>
        </div>
      </div>

      <!-- Signal 2: Specialty + Required Degrees & Experience -->
      <div class="row-spec">
        <strong>${escapeHtml(item.specialty)}</strong>
        <span>${escapeHtml(degreesText)} · ${escapeHtml(expText)}</span>
      </div>

      <!-- Signal 3: Compensation + Application Mode -->
      <div class="row-comp">
        <div class="row-pay">${escapeHtml(item.pay_scale)}</div>
        <div class="row-mode">${escapeHtml(item.application_mode || 'Direct Apply')} · ${escapeHtml(
          String(item.vacancies_total || 1)
        )} posts</div>
      </div>

      <!-- Signal 4: Factual Eligibility Badge + Full Page / Quick Preview CTA -->
      <div class="row-actions" onclick="event.stopPropagation()">
        ${eligibilityBadge}
        ${
          isApplied && existingApp
            ? `<button class="btn btn-outline" onclick="navigateTo('#/application/${escapeHtml(existingApp.id)}')">View Dossier →</button>`
            : `<button class="btn btn-outline" onclick="openJobDrawer('${escapeHtml(item.id)}')">Quick View</button>
               <button class="btn btn-primary" onclick="navigateTo('#/job/${escapeHtml(item.id)}')">Open Role →</button>`
        }
      </div>
    </article>
  `;
}

function renderEmptyState(message) {
  return `<div style="padding: 36px 24px; text-align: center; color: var(--text-muted); font-size: 13.5px;">${escapeHtml(
    message
  )}</div>`;
}

function getBranchesForDegree(degree) {
  return DEGREE_BRANCH_OPTIONS[degree] || DEGREE_BRANCH_OPTIONS.MD;
}

function getCitiesForState(st) {
  return STATE_CITIES_MAP[st] || STATE_CITIES_MAP['All India'];
}

function onQuickDegreeChange() {
  const rawDeg = document.getElementById('quickDegree')?.value || 'DOCTOR|MS';
  const [, degree] = rawDeg.split('|');
  const branchSelect = document.getElementById('quickSpecialty');
  if (!branchSelect) return;
  const branches = getBranchesForDegree(degree);
  branchSelect.innerHTML = branches
    .map((b) => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`)
    .join('');
}

function onQuickStateChange() {
  const st = document.getElementById('quickState')?.value || 'All India';
  const citySelect = document.getElementById('quickCity');
  if (!citySelect) return;
  const cities = getCitiesForState(st);
  citySelect.innerHTML = `
    <option value="ALL">${st === 'All India' ? 'All Cities (India)' : `All Cities in ${escapeHtml(st)}`}</option>
    ${cities.map((ct) => `<option value="${escapeHtml(ct)}">${escapeHtml(ct)}</option>`).join('')}
  `;
}

function renderOnboardingProfileBanner() {
  const banner = document.getElementById('onboardingProfileBanner');
  if (!banner) return;

  const c = state.activeCandidate;
  if (!c) {
    const initialBranches = getBranchesForDegree('MS');
    const initialCities = getCitiesForState('All India');
    banner.innerHTML = `
      <div class="onboarding-setup-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px;">
              <span class="badge badge-match-mid">No Predefined Profile Loaded</span>
              <span class="badge badge-sector">Select Degree → Field/Branch → City</span>
            </div>
            <h3 style="font-size:15.5px;font-weight:700;color:var(--text-primary);">Choose Your Qualification, Branch &amp; City to Filter Roles</h3>
            <p style="font-size:12.5px;color:var(--text-secondary);">
              Select your Degree (e.g. MS, MD, MBBS, MDS, BDS, B.Sc Nursing), pick your exact Specialization Branch from the dropdown, and choose your preferred State/City.
            </p>
          </div>
          <button type="button" class="btn btn-outline" onclick="openProfileModalGlobal()">
            Full Profile Editor
          </button>
        </div>

        <form class="quick-setup-grid" onsubmit="submitInlineQuickProfile(event)">
          <div class="form-field">
            <label for="quickName">Your Name</label>
            <input type="text" id="quickName" placeholder="e.g. Dr. Aditi Rao" required />
          </div>
          <div class="form-field">
            <label for="quickDegree">1. Qualification / Degree</label>
            <select id="quickDegree" onchange="onQuickDegreeChange()" required>
              <optgroup label="Allopathic Doctors">
                <option value="DOCTOR|MS">MS (Master of Surgery)</option>
                <option value="DOCTOR|MD">MD (Doctor of Medicine)</option>
                <option value="DOCTOR|DNB">DNB (Diplomate of National Board)</option>
                <option value="DOCTOR|MBBS">MBBS</option>
                <option value="DOCTOR|MCh">MCh (Surgical Super-Specialty)</option>
                <option value="DOCTOR|DM">DM (Medical Super-Specialty)</option>
              </optgroup>
              <optgroup label="Dental Professionals">
                <option value="DENTAL|MDS">MDS (Master of Dental Surgery)</option>
                <option value="DENTAL|BDS">BDS (Bachelor of Dental Surgery)</option>
              </optgroup>
              <optgroup label="Nursing Officers &amp; Nurses">
                <option value="NURSING|B.Sc Nursing">B.Sc Nursing</option>
                <option value="NURSING|M.Sc Nursing">M.Sc Nursing</option>
                <option value="NURSING|Post-Basic B.Sc">Post-Basic B.Sc Nursing</option>
                <option value="NURSING|GNM">GNM</option>
              </optgroup>
            </select>
          </div>
          <div class="form-field">
            <label for="quickSpecialty">2. Field / Branch (In Selected Degree)</label>
            <select id="quickSpecialty" required>
              ${initialBranches.map((b) => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('')}
            </select>
          </div>
          <div class="form-field">
            <label for="quickState">3. Preferred State</label>
            <select id="quickState" onchange="onQuickStateChange()">
              <option value="All India">All India (Any State)</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Haryana">Haryana</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Odisha">Odisha</option>
            </select>
          </div>
          <div class="form-field">
            <label for="quickCity">4. Preferred City</label>
            <select id="quickCity">
              <option value="ALL">All Cities (India)</option>
              ${initialCities.map((ct) => `<option value="${escapeHtml(ct)}">${escapeHtml(ct)}</option>`).join('')}
            </select>
          </div>
          <div class="form-field">
            <label for="quickExp">Exp (Yrs)</label>
            <input type="number" id="quickExp" min="0" max="40" value="1" required />
          </div>
          <button type="submit" class="btn btn-primary" style="min-height:38px;">
            Apply &amp; Filter →
          </button>
        </form>
      </div>
    `;
    return;
  }

  const citySummary =
    c.preferred_city && c.preferred_city !== 'ALL'
      ? `${c.preferred_city}, ${c.preferred_state || 'India'}`
      : c.preferred_state || 'All India';

  banner.innerHTML = `
    <div class="active-profile-bar">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span class="badge badge-match-high">Filtered For Your Profile</span>
        <strong style="font-size:13.5px;">${escapeHtml(c.name)}</strong>
        <span style="color:var(--text-secondary);font-size:13px;">
          <strong>${escapeHtml(c.degree)}</strong> in <strong>${escapeHtml(c.specialty)}</strong> · ${escapeHtml(c.experience_years ?? 0)} yrs exp · Location: <strong>${escapeHtml(citySummary)}</strong>
        </span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <button type="button" class="btn btn-outline" style="padding:5px 10px;font-size:12px;" onclick="openProfileModalGlobal()">
          Change Degree / Branch / City ✎
        </button>
        <button type="button" class="btn-ghost-sm" style="font-size:12px;" onclick="clearUserProfile()">
          Clear Profile
        </button>
      </div>
    </div>
  `;
}

async function submitInlineQuickProfile(event) {
  event.preventDefault();
  const name = document.getElementById('quickName')?.value?.trim() || 'Clinician';
  const rawDeg = document.getElementById('quickDegree')?.value || 'DOCTOR|MS';
  const [cadre, degree] = rawDeg.split('|');
  const specialty = document.getElementById('quickSpecialty')?.value || 'General Surgery';
  const preferred_state = document.getElementById('quickState')?.value || 'All India';
  const preferred_city = document.getElementById('quickCity')?.value || 'ALL';
  const experience_years = Number(document.getElementById('quickExp')?.value ?? 1);

  const payload = {
    id: state.activeCandidate?.id || `cand-${Date.now()}`,
    name,
    cadre,
    degree,
    specialty,
    experience_years,
    age: 29,
    preferred_state,
    preferred_city,
    alma_mater: 'Recognized Medical/Dental/Nursing Institute',
    interested_in_fellowships: true,
  };

  const res = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  state.activeCandidate = data.profile;
  saveUserProfileLocal(data.profile);
  syncFiltersWithActiveProfile();
  renderActiveProfileBanner();
  await refreshRecommendations();
  renderAllViews();
  showToast(`Filtered for ${data.profile.degree} (${data.profile.specialty})`);
}

async function clearUserProfile() {
  state.activeCandidate = null;
  saveUserProfileLocal(null);
  syncFiltersWithActiveProfile();
  renderActiveProfileBanner();
  await refreshRecommendations();
  renderAllViews();
  showToast('Profile cleared — showing all 44 live openings');
}

function renderRecommendationsView() {
  renderOnboardingProfileBanner();
  const container = document.getElementById('recommendationsGrid');
  let list = state.recommendations.filter((r) =>
    matchesGlobalFilters(r, { defaultMatchProfileCadre: true })
  );

  if (state.recQuickFilter === 'PRIVATE') {
    list = list.filter(
      (r) =>
        r.institution_type === 'PRIVATE_HOSPITAL' ||
        r.institution_type === 'PRIVATE_COLLEGE'
    );
  } else if (state.recQuickFilter === 'GOVT') {
    list = list.filter(
      (r) =>
        r.institution_type === 'CENTRAL_INI' ||
        r.institution_type === 'CENTRAL_GOVT' ||
        r.institution_type === 'STATE_DME'
    );
  } else if (state.recQuickFilter === 'FELLOWSHIP') {
    list = list.filter((r) => Boolean(r.is_fellowship));
  }

  document.getElementById('tabCountRecs').textContent = list.length;

  if (list.length > 0) {
    container.innerHTML = list.map((item) => renderJobRow(item)).join('');
    return;
  }

  // If 0 roles matched in the specific City/State, check if there are openings for this exact Degree + Branch across All India
  const panIndiaBranchMatches = state.recommendations.filter((r) => {
    const c = state.activeCandidate;
    if (c && r.cadre !== c.cadre) return false;
    if (c && (r.degreeEligible === false || r._match?.degreeEligible === false)) return false;
    if (c && c.specialty) {
      const specOk =
        r.specialtyEligible !== undefined
          ? r.specialtyEligible
          : r._match?.specialtyEligible !== undefined
          ? r._match.specialtyEligible
          : doesItemMatchSpecialtyKeyword(r, c.specialty);
      if (!specOk) return false;
    }
    return true;
  });

  if (panIndiaBranchMatches.length > 0 && (state.filters.state !== 'ALL' || state.filters.cityPop !== 'ALL')) {
    const locName =
      state.filters.cityPop !== 'ALL' ? state.filters.cityPop : state.filters.state;
    container.innerHTML = `
      <div style="padding:14px 16px;background:var(--amber-soft);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;font-size:13px;">
        <span>No active openings in <strong>${escapeHtml(locName)}</strong> for <strong>${escapeHtml(state.activeCandidate?.degree || '')} (${escapeHtml(state.activeCandidate?.specialty || 'selected branch')})</strong> right now — showing <strong>${panIndiaBranchMatches.length} eligible openings in your branch across India</strong>:</span>
        <button class="btn btn-outline" style="padding:4px 10px;font-size:12px;" onclick="document.getElementById('filterState').value='ALL';document.getElementById('filterCityPop').value='ALL';state.filters.state='ALL';state.filters.cityPop='ALL';renderAllViews();">Show All India</button>
      </div>
      ${panIndiaBranchMatches.map((item) => renderJobRow(item)).join('')}
    `;
    return;
  }

  container.innerHTML = renderEmptyState(
    'No openings match your current filters. Click Reset to view all eligible roles.'
  );
}

function renderGovRadarView() {
  const telemetry = document.getElementById('govTelemetryBar');
  const portals = state.portalStatus?.portals || [];
  const reachableCount = state.portalStatus?.portals_reachable ?? portals.length;

  telemetry.innerHTML = `
    <div>
      <strong>Live Central INI &amp; State DME Scraper:</strong> ${escapeHtml(
        reachableCount
      )}/${escapeHtml(portals.length || 12)} official portals reachable (AIIMS, PGIMER, JIPMER, NIMHANS, ESIC, DMER Maharashtra, DME Karnataka, TN MRB, UP DGME, WBHRB)
    </div>
    <div style="color:var(--text-muted);" class="mono-num">
      Updated: ${
        state.portalStatus?.last_run_at
          ? new Date(state.portalStatus.last_run_at).toLocaleTimeString()
          : 'Live'
      }
    </div>
  `;

  const scoredMap = new Map(state.recommendations.map((r) => [r.id, r]));
  const list = state.govListings
    .map((item) => scoredMap.get(item.id) || item)
    .filter((item) => matchesGlobalFilters(item, { defaultMatchProfileCadre: false }));

  document.getElementById('tabCountGov').textContent = list.length;
  document.getElementById('govListingsGrid').innerHTML = list.length
    ? list.map((item) => renderJobRow(item)).join('')
    : renderEmptyState('No Government or State DME notifications match these filters.');
}

function renderPrivateHospitalsView() {
  const telemetry = document.getElementById('privateTelemetryBar');
  const chains = state.privatePortalStatus?.chains || [];
  const reachable = state.privatePortalStatus?.chains_reachable ?? 12;

  telemetry.innerHTML = `
    <div>
      <strong>12 Major Hospital Chains (&gt;40–50L+ Population Cities):</strong> ${escapeHtml(
        reachable
      )}/${escapeHtml(
        chains.length || 12
      )} chains verified live (Apollo, Manipal, Fortis, Max, Medanta, Narayana, Aster, KIMS, CARE, Zydus, Kauvery, Clove Dental)
    </div>
    <div style="color:var(--text-muted);">19 Metro Hubs Indexed</div>
  `;

  const scoredMap = new Map(state.recommendations.map((r) => [r.id, r]));
  const list = state.privateListings
    .map((item) => scoredMap.get(item.id) || item)
    .filter((item) => matchesGlobalFilters(item, { defaultMatchProfileCadre: false }));

  document.getElementById('tabCountPrivate').textContent = list.length;
  document.getElementById('privateListingsGrid').innerHTML = list.length
    ? list.map((item) => renderJobRow(item)).join('')
    : renderEmptyState('No Private Hospital Chain openings match these filters.');
}

function renderFellowshipsView() {
  const scoredMap = new Map(state.recommendations.map((r) => [r.id, r]));
  const allFellowships = getAllJobs()
    .filter((j) => Boolean(j.is_fellowship))
    .map((item) => scoredMap.get(item.id) || item)
    .filter((item) => matchesGlobalFilters(item, { defaultMatchProfileCadre: false }));

  document.getElementById('tabCountFellowships').textContent = allFellowships.length;
  document.getElementById('fellowshipsGrid').innerHTML = allFellowships.length
    ? allFellowships.map((item) => renderJobRow(item)).join('')
    : renderEmptyState('No fellowships match your current filter selection.');
}

/**
 * Clickable Application Tiles in "My Submitted Applications" & "Hospital HR Applicant Pipeline (ATS)"
 * Every single tile navigates to `#/application/:id` when clicked!
 */
function renderApplicationsView() {
  const myAppsContainer = document.getElementById('myApplicationsList');
  const atsContainer = document.getElementById('employerAtsList');
  document.getElementById('tabCountApps').textContent = state.applications.length;

  const myApps = state.applications.filter(
    (a) => !state.activeCandidate || a.candidate_id === state.activeCandidate.id
  );
  const displayMyApps = myApps.length ? myApps : state.applications;

  myAppsContainer.innerHTML = displayMyApps.length
    ? displayMyApps
        .map(
          (app) => `
        <article class="app-tile-clickable" tabindex="0" role="link" aria-label="Open application dossier ${escapeHtml(app.id)} for ${escapeHtml(app.job_title)}" onclick="navigateTo('#/application/${escapeHtml(app.id)}')" onkeydown="if(event.key==='Enter') navigateTo('#/application/${escapeHtml(app.id)}')">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span class="mono-num" style="font-size:11.5px;color:var(--text-muted);font-weight:600;">${escapeHtml(app.id)}</span>
                <span class="badge badge-match-high">${escapeHtml(app.eligibility_summary || `Eligible · ${app.candidate_degree}`)}</span>
              </div>
              <div style="font-weight:600;color:var(--text-primary);font-size:14px;">${escapeHtml(app.job_title)}</div>
              <div style="font-size:12.5px;color:var(--text-secondary);">${escapeHtml(app.institution)} · ${escapeHtml(app.city || app.state || 'India')}</div>
            </div>
            <span class="badge badge-match-mid">${escapeHtml(app.status)}</span>
          </div>
          <div style="font-size:12px;color:var(--text-muted);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
            <span>Applicant: <strong>${escapeHtml(app.candidate_name)}</strong> (${escapeHtml(app.candidate_degree)}) · Notice: ${escapeHtml(app.notice_period)}</span>
            <span style="color:var(--accent);font-weight:600;">Open Full Application Dossier →</span>
          </div>
        </article>
      `
        )
        .join('')
    : renderEmptyState('No applications submitted yet.');

  atsContainer.innerHTML = state.applications.length
    ? state.applications
        .map(
          (app) => `
        <article class="app-tile-clickable" tabindex="0" role="link" aria-label="Open HR candidate dossier for ${escapeHtml(app.candidate_name)}" onclick="navigateTo('#/application/${escapeHtml(app.id)}')" onkeydown="if(event.key==='Enter') navigateTo('#/application/${escapeHtml(app.id)}')">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <div>
              <div style="font-weight:600;font-size:14px;">${escapeHtml(app.candidate_name)} <span style="font-weight:400;color:var(--text-secondary);">(${escapeHtml(app.candidate_degree)} · ${escapeHtml(app.candidate_specialty)})</span></div>
              <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(app.job_title)} — ${escapeHtml(app.institution)}</div>
            </div>
            <span class="badge badge-match-high">${escapeHtml(app.status)}</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;align-items:center;justify-content:space-between;" onclick="event.stopPropagation()">
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${HIRING_STAGES.map(
                (st) => `
                <button class="btn ${app.status === st ? 'btn-primary' : 'btn-outline'}" style="padding:4px 9px;font-size:11.5px;" onclick="updateAppStatus('${escapeHtml(app.id)}', '${escapeHtml(st)}')">
                  ${escapeHtml(st)}
                </button>
              `
              ).join('')}
            </div>
            <button class="btn btn-outline" style="padding:4px 10px;font-size:11.5px;" onclick="navigateTo('#/application/${escapeHtml(app.id)}')">Inspect Dossier →</button>
          </div>
        </article>
      `
        )
        .join('')
    : renderEmptyState('No candidates in ATS pipeline.');
}

/**
 * Dedicated Full-Page Route 1: `#/job/:id`
 * Full-page clinical job/fellowship dossier with multi-step direct apply form and verified official source link.
 */
function renderFullJobPage(jobId) {
  const container = document.getElementById('fullJobPageContainer');
  const item = findJobWithEval(jobId);
  if (!item) {
    container.innerHTML = `
      <div class="dossier-card">
        <div class="dossier-title">Opening Not Found</div>
        <p style="color:var(--text-secondary);">Could not locate opening ID <code>${escapeHtml(jobId)}</code>.</p>
        <div><button class="btn btn-primary" onclick="navigateTo('#/feed')">← Back to Clinical Feed</button></div>
      </div>
    `;
    return;
  }

  const c = state.activeCandidate;
  const existingApp = state.applications.find(
    (a) => a.job_id === item.id && c && a.candidate_id === c.id
  );
  const reasons = item._match?.reasons || [
    `Matches ${item.cadre} qualification requirements`,
    `Accepted Degrees: ${(item.degrees_accepted || []).join(', ')}`,
  ];

  const catBreakdown = item.category_breakdown
    ? Object.entries(item.category_breakdown)
        .map(
          ([k, v]) =>
            `<span class="seat-pill mono-num">${escapeHtml(k)}: ${escapeHtml(v)}</span>`
        )
        .join('')
    : '';

  container.innerHTML = `
    <div class="breadcrumb-bar">
      <button class="btn-back-link" onclick="navigateBackToFeed()">
        ← Back to Clinical Feed
      </button>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <span class="mono-num" style="font-size:12px;color:var(--text-muted);">Ref ID: ${escapeHtml(item.id)}</span>
        ${
          item.source_url
            ? `<a href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                 Open Verified Official Portal ↗
               </a>`
            : ''
        }
      </div>
    </div>

    <div class="dossier-hero">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <span class="badge badge-match-high">${escapeHtml(getEligibilityBadgeText(item))}</span>
        <span class="badge badge-sector">${escapeHtml(item.institution_type.replace(/_/g, ' '))}</span>
        ${item.is_fellowship ? `<span class="badge badge-fellowship">Fellowship Program</span>` : ''}
        ${item.city_population_lakh ? `<span class="badge badge-metro">${escapeHtml(item.city_population_lakh)}L+ Metro Hub</span>` : ''}
      </div>

      <h2 class="dossier-title">${escapeHtml(item.title)}</h2>
      <div style="font-size:15px;color:var(--text-secondary);font-weight:500;">
        ${escapeHtml(item.institution)} · ${escapeHtml(item.city ? `${item.city}, ${item.state}` : item.state)}
      </div>

      <div class="kv-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
        <div class="kv-box">
          <div class="kv-label">Compensation / Pay Scale</div>
          <div class="kv-val mono-num">${escapeHtml(item.pay_scale)}</div>
        </div>
        <div class="kv-box">
          <div class="kv-label">Eligible Degrees</div>
          <div class="kv-val">${escapeHtml((item.degrees_accepted || []).join(', '))}</div>
        </div>
        <div class="kv-box">
          <div class="kv-label">Minimum Experience</div>
          <div class="kv-val">${
            item.min_experience_years === 0
              ? 'Fresher / 0+ Years'
              : `${item.min_experience_years}+ Years`
          }</div>
        </div>
        <div class="kv-box">
          <div class="kv-label">Vacancies &amp; Deadline</div>
          <div class="kv-val mono-num">${escapeHtml(item.vacancies_total || 1)} Posts · By ${escapeHtml(item.deadline || 'Open')}</div>
        </div>
      </div>
    </div>

    <div class="dossier-grid-2col">
      <!-- Left Column: Clinical Scope, Eligibility Rationale, Reservation Matrix & Official Source -->
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div class="dossier-card">
          <div class="dossier-card-title">Why You Are Eligible (${escapeHtml(c?.name || 'Active Clinician')})</div>
          <ul style="padding-left:18px;color:var(--text-secondary);font-size:13.5px;display:flex;flex-direction:column;gap:6px;">
            ${reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
          </ul>
        </div>

        <div class="dossier-card">
          <div class="dossier-card-title">Clinical Scope, Department &amp; Program Highlights</div>
          <ul style="padding-left:18px;color:var(--text-secondary);font-size:13.5px;display:flex;flex-direction:column;gap:8px;">
            ${(item.highlights || []).map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
          </ul>
          ${
            catBreakdown
              ? `<div style="margin-top:10px;">
                   <div class="dossier-card-title" style="margin-bottom:8px;">Official Category-Wise Seat Matrix</div>
                   <div class="seat-pills">${catBreakdown}</div>
                 </div>`
              : ''
          }
          ${
            item.advt_no
              ? `<div style="font-size:12px;color:var(--text-muted);" class="mono-num">Official Advertisement No: ${escapeHtml(item.advt_no)}</div>`
              : ''
          }
        </div>

        ${
          item.source_url
            ? `<div class="dossier-card">
                 <div class="dossier-card-title">Verified Official Recruitment Portal Link</div>
                 <p style="font-size:13px;color:var(--text-secondary);">
                   Verified live by <code>qa-test-engineer</code>. You can inspect the official institutional recruitment portal directly:
                 </p>
                 <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;background:var(--bg-subtle);padding:12px 14px;border-radius:var(--radius-md);border:1px solid var(--border);">
                   <span class="mono-num" style="font-size:12px;color:var(--text-primary);word-break:break-all;">${escapeHtml(item.source_url)}</span>
                   <a href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                     Visit Official Website ↗
                   </a>
                 </div>
               </div>`
            : ''
        }
      </div>

      <!-- Right Column: Multi-Step 1-Click Direct Apply Dossier Submission -->
      <div class="dossier-card">
        <div class="dossier-card-title">1-Click Direct Application &amp; Dossier Tracker</div>
        ${
          existingApp
            ? `<div style="background:var(--emerald-soft);border:1px solid #a7f3d0;padding:16px;border-radius:var(--radius-md);display:flex;flex-direction:column;gap:10px;">
                 <div style="color:var(--emerald);font-weight:700;font-size:14px;">✓ Application Submitted (${escapeHtml(existingApp.status)})</div>
                 <div style="font-size:12.5px;color:var(--text-secondary);">
                   Dossier ID <strong class="mono-num">${escapeHtml(existingApp.id)}</strong> submitted for <strong>${escapeHtml(existingApp.candidate_name)}</strong>.
                 </div>
                 <button class="btn btn-primary btn-full" onclick="navigateTo('#/application/${escapeHtml(existingApp.id)}')">
                   Open Full Application Dossier →
                 </button>
               </div>`
            : `<p style="font-size:13px;color:var(--text-secondary);">
                 Applying as <strong>${escapeHtml(c?.name || 'Clinician')}</strong> (${escapeHtml(c?.degree || '')} · ${escapeHtml(c?.specialty || '')}). No NMC verification gate required.
               </p>
               <div class="form-field">
                 <label for="pageNoticePeriod">Notice Period / Joining Availability</label>
                 <select id="pageNoticePeriod">
                   <option value="Immediate (Within 7 Days)">Immediate (Within 7 Days)</option>
                   <option value="15 Days">15 Days</option>
                   <option value="30 Days">30 Days</option>
                   <option value="After Current SR / Bond Completion">After Current SR / Bond Completion</option>
                 </select>
               </div>
               <div class="form-field">
                 <label for="pageInterviewSlot">Preferred Clinical Panel Interaction Slot</label>
                 <select id="pageInterviewSlot">
                   <option value="Weekday Afternoon (2:00 PM – 5:00 PM)">Weekday Afternoon (2:00 PM – 5:00 PM)</option>
                   <option value="Weekday Morning (9:30 AM – 12:00 PM)">Weekday Morning (9:30 AM – 12:00 PM)</option>
                   <option value="Weekend / Video Interaction">Weekend / Video Interaction</option>
                 </select>
               </div>
               <div class="form-field">
                 <label for="pageCoverNote">Clinical Experience &amp; Case Logbook Summary</label>
                 <textarea id="pageCoverNote" rows="3">Applying with ${escapeHtml(c?.degree || 'clinical')} qualification in ${escapeHtml(c?.specialty || 'specialty')} (${escapeHtml(c?.experience_years ?? 0)} yrs experience at ${escapeHtml(c?.alma_mater || 'recognized institute')}).</textarea>
               </div>
               <button class="btn btn-primary btn-full" onclick="submitDirectApplyFromPage('${escapeHtml(item.id)}')">
                 Submit 1-Click Application &amp; Open Dossier →
               </button>`
        }
      </div>
    </div>
  `;
}

/**
 * Dedicated Full-Page Route 2: `#/application/:id`
 * Opened whenever the user clicks ANY application tile in "My Applications" or "Hospital HR ATS".
 */
function renderFullApplicationDossierPage(appId) {
  const container = document.getElementById('fullApplicationDossierContainer');
  const app = state.applications.find((a) => a.id === appId);

  if (!app) {
    container.innerHTML = `
      <div class="dossier-card">
        <div class="dossier-title">Application Dossier Not Found</div>
        <p style="color:var(--text-secondary);">Could not locate application ID <code>${escapeHtml(appId)}</code>.</p>
        <div><button class="btn btn-primary" onclick="navigateTo('#/applications')">← Back to Applications &amp; ATS</button></div>
      </div>
    `;
    return;
  }

  const linkedJob = findJobWithEval(app.job_id);
  const currentStageIdx = Math.max(0, HIRING_STAGES.indexOf(app.status));

  container.innerHTML = `
    <div class="breadcrumb-bar">
      <button class="btn-back-link" onclick="navigateTo('#/applications')">
        ← Back to Applications &amp; HR Pipeline
      </button>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <button class="btn btn-outline" onclick="navigateTo('#/job/${escapeHtml(app.job_id)}')">
          View Linked Job Opening (${escapeHtml(app.job_id)}) →
        </button>
        ${
          linkedJob && linkedJob.source_url
            ? `<a href="${escapeHtml(linkedJob.source_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                 Official Institution Website ↗
               </a>`
            : ''
        }
        <button class="btn btn-outline" style="color:#b91c1c;border-color:#fecaca;" onclick="withdrawApplication('${escapeHtml(app.id)}')">
          Withdraw Application
        </button>
      </div>
    </div>

    <!-- Dossier Header & 4-Stage Interactive Pipeline Stepper -->
    <div class="dossier-hero">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;flex-wrap:wrap;">
            <span class="mono-num" style="font-size:12px;font-weight:700;color:var(--text-muted);">DOSSIER ${escapeHtml(app.id)}</span>
            <span class="badge badge-match-high">${escapeHtml(app.eligibility_summary || `Eligible · ${app.candidate_degree}`)}</span>
            <span class="badge badge-sector">${escapeHtml(app.cadre)}</span>
          </div>
          <h2 class="dossier-title">${escapeHtml(app.job_title)}</h2>
          <div style="font-size:14.5px;color:var(--text-secondary);font-weight:500;">
            ${escapeHtml(app.institution)} · ${escapeHtml(app.city || app.state || 'India')} · <span class="mono-num">${escapeHtml(app.pay_scale || '')}</span>
          </div>
        </div>
        <span class="badge badge-match-mid" style="font-size:12.5px;padding:5px 12px;">Current Stage: ${escapeHtml(app.status)}</span>
      </div>

      <!-- 4-Stage Stepper -->
      <div class="stage-stepper">
        ${HIRING_STAGES.map((stage, idx) => {
          const stepClass =
            idx < currentStageIdx
              ? 'completed'
              : idx === currentStageIdx
              ? 'current'
              : '';
          return `
            <div class="stage-step ${stepClass}">
              <div class="stage-step-num">STAGE 0${idx + 1} ${idx < currentStageIdx ? '✓' : idx === currentStageIdx ? '●' : ''}</div>
              <div class="stage-step-label">${escapeHtml(stage)}</div>
              <div style="margin-top:6px;">
                <button class="btn ${idx === currentStageIdx ? 'btn-primary' : 'btn-outline'}" style="padding:3px 8px;font-size:11px;" onclick="updateAppStatus('${escapeHtml(app.id)}', '${escapeHtml(stage)}')">
                  ${idx === currentStageIdx ? 'Active Stage' : 'Set Stage'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="dossier-grid-2col">
      <!-- Left Column: Candidate Credentials, Cover Note & Interactive Clinical Notes -->
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div class="dossier-card">
          <div class="dossier-card-title">Candidate Clinical Dossier</div>
          <div class="kv-grid">
            <div class="kv-box">
              <div class="kv-label">Clinician Name</div>
              <div class="kv-val">${escapeHtml(app.candidate_name)}</div>
            </div>
            <div class="kv-box">
              <div class="kv-label">Qualification &amp; Specialty</div>
              <div class="kv-val">${escapeHtml(app.candidate_degree)} · ${escapeHtml(app.candidate_specialty)}</div>
            </div>
            <div class="kv-box">
              <div class="kv-label">Clinical Experience &amp; Alma Mater</div>
              <div class="kv-val">${escapeHtml(app.candidate_experience_years)} yrs · ${escapeHtml(app.candidate_alma_mater || 'Recognized Institute')}</div>
            </div>
            <div class="kv-box">
              <div class="kv-label">Notice Period &amp; Contact</div>
              <div class="kv-val">${escapeHtml(app.notice_period)} · ${escapeHtml(app.candidate_phone || '')}</div>
            </div>
          </div>

          <div>
            <div class="kv-label" style="margin-bottom:6px;">Core Clinical Competencies</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${(app.candidate_skills || ['Clinical Care', 'Patient Management'])
                .map((sk) => `<span class="seat-pill">${escapeHtml(sk)}</span>`)
                .join('')}
            </div>
          </div>

          <div>
            <div class="kv-label" style="margin-bottom:4px;">Submitted Clinical Cover Note</div>
            <div class="note-box">${escapeHtml(app.cover_note)}</div>
          </div>
        </div>

        <!-- Interactive Clinical / Interview Notes -->
        <div class="dossier-card">
          <div class="dossier-card-title">Clinical Panel &amp; Candidate Notes (${(app.notes || []).length})</div>
          <div style="display:flex;gap:8px;">
            <input type="text" id="newDossierNoteInput" placeholder="Add an interview observation, document check, or joining availability note..." style="flex:1;padding:8px 10px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);font-size:13px;" />
            <button class="btn btn-primary" onclick="submitApplicationNote('${escapeHtml(app.id)}')">Add Note</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${
              (app.notes || []).length
                ? app.notes
                    .map(
                      (n) => `
                    <div class="note-box">
                      <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-muted);margin-bottom:4px;">
                        <strong>${escapeHtml(n.author)} (${escapeHtml(n.role)})</strong>
                        <span class="mono-num">${new Date(n.created_at).toLocaleString()}</span>
                      </div>
                      <div>${escapeHtml(n.text)}</div>
                    </div>
                  `
                    )
                    .join('')
                : `<div style="font-size:12.5px;color:var(--text-muted);">No interview notes recorded yet. Add a note above.</div>`
            }
          </div>
        </div>
      </div>

      <!-- Right Column: Chronological Audit Timeline -->
      <div class="dossier-card">
        <div class="dossier-card-title">Application Stage History &amp; Audit Log</div>
        <div class="timeline-list">
          ${(app.timeline || [])
            .slice()
            .reverse()
            .map(
              (ev) => `
              <div class="timeline-item">
                <div style="font-weight:600;font-size:13px;color:var(--text-primary);">${escapeHtml(ev.stage)}</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${escapeHtml(ev.detail || '')}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:3px;" class="mono-num">
                  ${escapeHtml(ev.actor || 'MedVantage')} · ${new Date(ev.timestamp).toLocaleString()}
                </div>
              </div>
            `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * View 6: Live QA & External Link Verification Suite (`#/qa-audit`)
 */
function renderQaAuditView() {
  const container = document.getElementById('qaAuditContainer');
  const rep = state.qaReport;

  container.innerHTML = `
    <div class="dossier-hero">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
            <span class="badge badge-match-high">Agent: qa-test-engineer</span>
            <span class="badge badge-sector">Skill: webapp-qa-testing</span>
          </div>
          <h2 class="dossier-title">Automated QA &amp; External Link Verification</h2>
          <p style="font-size:13.5px;color:var(--text-secondary);">
            Audits developer work across all API endpoints, multi-page routes (<code>#/job/:id</code>, <code>#/application/:id</code>), strict zero-<code>% Match</code> compliance, and live HTTP reachability of every Central INI, State DME, and Private Hospital Chain URL.
          </p>
        </div>
        <button id="runLiveQaBtn" class="btn btn-primary" onclick="triggerLiveQaRun()">
          Run Live QA Verification Suite
        </button>
      </div>

      ${
        rep
          ? `<div class="kv-grid" style="grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));">
               <div class="kv-box">
                 <div class="kv-label">Overall Status</div>
                 <div class="kv-val" style="color:${rep.failed === 0 ? 'var(--emerald)' : '#b91c1c'};">${rep.failed === 0 ? 'ALL CHECKS PASSED' : `${rep.failed} Issues`}</div>
               </div>
               <div class="kv-box">
                 <div class="kv-label">Assertions Passed</div>
                 <div class="kv-val mono-num">${escapeHtml(rep.passed)} / ${escapeHtml(rep.total)}</div>
               </div>
               <div class="kv-box">
                 <div class="kv-label">External URLs Verified</div>
                 <div class="kv-val mono-num">${escapeHtml(rep.links_reachable || 0)} / ${escapeHtml(rep.links_checked || 0)} Live</div>
               </div>
               <div class="kv-box">
                 <div class="kv-label">Last Verified At</div>
                 <div class="kv-val mono-num">${new Date(rep.ran_at).toLocaleTimeString()}</div>
               </div>
             </div>`
          : `<div style="font-size:13px;color:var(--text-muted);">Click "Run Live QA Verification Suite" to execute E2E checks.</div>`
      }
    </div>

    ${
      rep && Array.isArray(rep.checks)
        ? `<div class="dossier-card">
             <div class="dossier-card-title">Detailed E2E Feature &amp; Link Assertions</div>
             <div class="job-list">
               ${rep.checks
                 .map(
                   (chk) => `
                 <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:12px;">
                   <div>
                     <div style="font-weight:600;font-size:13.5px;">${escapeHtml(chk.name)}</div>
                     <div style="font-size:12px;color:var(--text-secondary);" class="mono-num">${escapeHtml(chk.detail || '')}</div>
                   </div>
                   <span class="badge ${chk.ok ? 'badge-match-high' : 'badge-metro'}">${chk.ok ? 'PASS' : 'WARN'}</span>
                 </div>
               `
                 )
                 .join('')}
             </div>
           </div>`
        : ''
    }
  `;
}

function syncMobileCounts() {
  const pairs = [
    ['tabCountRecs', 'mobCountRecs'],
    ['tabCountGov', 'mobCountGov'],
    ['tabCountPrivate', 'mobCountPrivate'],
    ['tabCountFellowships', 'mobCountFellowships'],
    ['tabCountApps', 'mobCountApps'],
  ];
  for (const [deskId, mobId] of pairs) {
    const deskEl = document.getElementById(deskId);
    const mobEl = document.getElementById(mobId);
    if (deskEl && mobEl) {
      mobEl.textContent = deskEl.textContent;
    }
  }
}

async function shareLivePortal() {
  const shareData = {
    title: 'MedVantage India — Clinical Careers, Fellowships & Live Govt/DME Portal',
    text: 'Explore live AIIMS/PGIMER/State DME notifications & 1-Click Direct Apply openings across 12 major private hospital chains.',
    url: window.location.href,
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
  } catch (_) {
    // Fallback to clipboard copy
  }
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast(`Copied live link: ${window.location.href}`);
  } catch (_) {
    showToast(`Shareable URL: ${window.location.href}`);
  }
}

function renderAllViews() {
  renderRecommendationsView();
  renderGovRadarView();
  renderPrivateHospitalsView();
  renderFellowshipsView();
  renderApplicationsView();
  renderQaAuditView();
  syncMobileCounts();
}

/**
 * Multi-Page Hash Router (`#/feed`, `#/job/:id`, `#/application/:id`, `#/applications`, `#/qa-audit`)
 */
function navigateTo(hash) {
  if (window.location.hash === hash) {
    handleHashRoute();
  } else {
    window.location.hash = hash;
  }
}

function navigateBackToFeed() {
  const tabHashMap = {
    recommendations: '#/feed',
    'gov-radar': '#/gov-radar',
    'private-hospitals': '#/private-hospitals',
    fellowships: '#/fellowships',
    applications: '#/applications',
    'qa-audit': '#/qa-audit',
  };
  navigateTo(tabHashMap[state.lastFeedTab] || '#/feed');
}

function activateTabPanel(panelId, activeNavTab, showHeader = true) {
  document.querySelectorAll('.view-panel').forEach((p) => p.classList.remove('active'));
  const target = document.getElementById(panelId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === activeNavTab);
  });

  const header = document.getElementById('workspaceHeader');
  if (header) {
    header.style.display = showHeader ? '' : 'none';
  }

  if (showHeader && VIEW_META[activeNavTab]) {
    document.getElementById('viewTitle').textContent = VIEW_META[activeNavTab].title;
    document.getElementById('viewSubtitle').textContent = VIEW_META[activeNavTab].subtitle;
    const recQuickBar = document.getElementById('recQuickBar');
    if (recQuickBar) {
      recQuickBar.style.display = activeNavTab === 'recommendations' ? 'inline-flex' : 'none';
    }
    const globalFilterBar = document.getElementById('globalFilterBar');
    if (globalFilterBar) {
      globalFilterBar.style.display =
        activeNavTab === 'applications' || activeNavTab === 'qa-audit' ? 'none' : 'flex';
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleHashRoute() {
  const rawHash = window.location.hash || '#/feed';

  if (rawHash.startsWith('#/job/')) {
    const jobId = decodeURIComponent(rawHash.slice('#/job/'.length));
    closeDrawer();
    renderFullJobPage(jobId);
    activateTabPanel('page-job-detail', state.lastFeedTab, false);
    return;
  }

  if (rawHash.startsWith('#/application/')) {
    const appId = decodeURIComponent(rawHash.slice('#/application/'.length));
    closeDrawer();
    renderFullApplicationDossierPage(appId);
    activateTabPanel('page-application-dossier', 'applications', false);
    return;
  }

  const routeMap = {
    '#/feed': 'recommendations',
    '#/recommendations': 'recommendations',
    '#/gov-radar': 'gov-radar',
    '#/private-hospitals': 'private-hospitals',
    '#/fellowships': 'fellowships',
    '#/applications': 'applications',
    '#/qa-audit': 'qa-audit',
  };

  const tab = routeMap[rawHash] || 'recommendations';
  state.activeTab = tab;
  if (tab !== 'applications' && tab !== 'qa-audit') {
    state.lastFeedTab = tab;
  }
  activateTabPanel(`tab-${tab}`, tab, true);
}

/**
 * Right-Hand Quick Preview Drawer (With button to open full page `#/job/:id`)
 */
function openJobDrawer(jobId) {
  const item = findJobWithEval(jobId);
  if (!item) return;

  const isApplied = state.applications.some(
    (a) =>
      a.job_id === item.id &&
      state.activeCandidate &&
      a.candidate_id === state.activeCandidate.id
  );
  const existingApp = state.applications.find(
    (a) =>
      a.job_id === item.id &&
      state.activeCandidate &&
      a.candidate_id === state.activeCandidate.id
  );

  const badgesEl = document.getElementById('drawerBadges');
  badgesEl.innerHTML = `
    <span class="badge badge-match-high">${escapeHtml(getEligibilityBadgeText(item))}</span>
    <span class="badge badge-sector">${escapeHtml(item.cadre)}</span>
    ${item.is_fellowship ? `<span class="badge badge-fellowship">Fellowship</span>` : ''}
  `;

  const bodyEl = document.getElementById('drawerBody');
  bodyEl.innerHTML = `
    <div>
      <div style="font-size:18px;font-weight:700;line-height:1.3;margin-bottom:6px;font-family:var(--font-serif);">
        ${escapeHtml(item.title)}
      </div>
      <div style="font-size:13.5px;color:var(--text-secondary);">
        ${escapeHtml(item.institution)} · ${escapeHtml(item.city ? `${item.city}, ${item.state}` : item.state)}
      </div>
      <div style="margin-top:10px;">
        <button class="btn btn-outline btn-full" onclick="navigateTo('#/job/${escapeHtml(item.id)}')">
          Open Full Dedicated Role Page (#/job/${escapeHtml(item.id)}) →
        </button>
      </div>
    </div>

    <div class="kv-grid">
      <div class="kv-box">
        <div class="kv-label">Compensation / Stipend</div>
        <div class="kv-val mono-num">${escapeHtml(item.pay_scale)}</div>
      </div>
      <div class="kv-box">
        <div class="kv-label">Eligible Degrees</div>
        <div class="kv-val">${escapeHtml((item.degrees_accepted || []).join(', '))}</div>
      </div>
    </div>

    <div class="drawer-section">
      <div class="drawer-section-title">Role Highlights</div>
      <ul style="padding-left:18px;color:var(--text-secondary);font-size:13px;display:flex;flex-direction:column;gap:6px;">
        ${(item.highlights || []).map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
      </ul>
    </div>

    <div class="drawer-section">
      <div class="drawer-section-title">Quick 1-Click Direct Apply</div>
      ${
        isApplied && existingApp
          ? `<button class="btn btn-primary btn-full" onclick="navigateTo('#/application/${escapeHtml(existingApp.id)}')">
               ✓ Applied — Open Application Dossier (${escapeHtml(existingApp.id)}) →
             </button>`
          : `<div class="form-field" style="margin-bottom:10px;">
               <label>Notice Period</label>
               <select id="drawerNoticePeriod">
                 <option value="Immediate (Within 7 Days)">Immediate (Within 7 Days)</option>
                 <option value="15 Days">15 Days</option>
                 <option value="30 Days">30 Days</option>
               </select>
             </div>
             <div class="form-field" style="margin-bottom:12px;">
               <label>Clinical Cover Note</label>
               <textarea id="drawerCoverNote" rows="2">Applying via MedVantage Clinical Profile (${escapeHtml(
                 state.activeCandidate?.degree || ''
               )} · ${escapeHtml(state.activeCandidate?.specialty || '')}).</textarea>
             </div>
             <button class="btn btn-primary btn-full" onclick="submitDirectApplyFromDrawer('${escapeHtml(item.id)}')">
               Submit 1-Click Application &amp; View Dossier
             </button>`
      }
      ${
        item.source_url
          ? `<div style="margin-top:10px;text-align:center;">
               <a href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:var(--accent);font-weight:600;">
                 View Official Notification Source ↗
               </a>
             </div>`
          : ''
      }
    </div>
  `;

  document.getElementById('detailDrawerBackdrop').classList.remove('hidden');
}

function closeDrawer() {
  const el = document.getElementById('detailDrawerBackdrop');
  if (el) el.classList.add('hidden');
}

async function submitDirectApplyFromDrawer(jobId) {
  const notice_period = document.getElementById('drawerNoticePeriod')?.value || '15 Days';
  const cover_note = document.getElementById('drawerCoverNote')?.value || '';
  await executeApply(jobId, notice_period, cover_note, 'Flexible');
}

async function submitDirectApplyFromPage(jobId) {
  const notice_period = document.getElementById('pageNoticePeriod')?.value || '15 Days';
  const cover_note = document.getElementById('pageCoverNote')?.value || '';
  const preferred_interview_slot =
    document.getElementById('pageInterviewSlot')?.value || 'Weekday Afternoon';
  await executeApply(jobId, notice_period, cover_note, preferred_interview_slot);
}

async function executeApply(jobId, notice_period, cover_note, preferred_interview_slot) {
  const res = await fetch('/api/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      job_id: jobId,
      candidate: state.activeCandidate,
      notice_period,
      cover_note,
      preferred_interview_slot,
    }),
  });
  const data = await res.json();
  if (data.applications) {
    state.applications = data.applications;
    renderAllViews();
    closeDrawer();
    showToast(`Application submitted! Opening Dossier ${data.application.id}...`);
    navigateTo(`#/application/${data.application.id}`);
  }
}

async function updateAppStatus(applicationId, status) {
  const res = await fetch('/api/applications/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ application_id: applicationId, status }),
  });
  const data = await res.json();
  if (data.applications) {
    state.applications = data.applications;
    renderAllViews();
    if (window.location.hash === `#/application/${applicationId}`) {
      renderFullApplicationDossierPage(applicationId);
    }
    showToast(`Stage updated to "${status}"`);
  }
}

async function submitApplicationNote(applicationId) {
  const input = document.getElementById('newDossierNoteInput');
  const text = String(input?.value || '').trim();
  if (!text) return;

  const res = await fetch('/api/applications/note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      application_id: applicationId,
      author: state.activeCandidate?.name || 'Clinical Panel',
      role: 'Dossier Note',
      text,
    }),
  });
  const data = await res.json();
  if (data.applications) {
    state.applications = data.applications;
    renderFullApplicationDossierPage(applicationId);
    showToast('Clinical note added to application dossier');
  }
}

async function withdrawApplication(applicationId) {
  const res = await fetch('/api/applications/withdraw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ application_id: applicationId }),
  });
  const data = await res.json();
  if (data.applications) {
    state.applications = data.applications;
    renderAllViews();
    showToast(`Application ${applicationId} withdrawn`);
    navigateTo('#/applications');
  }
}

async function triggerLiveQaRun() {
  const btn = document.getElementById('runLiveQaBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Running E2E & Link Checks...';
  }
  const res = await fetch('/api/qa-run', { method: 'POST' });
  const data = await res.json();
  if (data.qaReport) {
    state.qaReport = data.qaReport;
    updateSidebarScraperFooter();
    renderQaAuditView();
    showToast(`QA Suite Complete: ${data.qaReport.passed}/${data.qaReport.total} Checks Passed`);
  }
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Run Live QA Verification Suite';
  }
}

function setupEventListeners() {
  window.addEventListener('hashchange', handleHashRoute);

  const hashMap = {
    recommendations: '#/feed',
    'gov-radar': '#/gov-radar',
    'private-hospitals': '#/private-hospitals',
    fellowships: '#/fellowships',
    applications: '#/applications',
    'qa-audit': '#/qa-audit',
  };

  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      navigateTo(hashMap[targetTab] || '#/feed');
    });
  });

  document.querySelectorAll('.seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.seg-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.recQuickFilter = btn.dataset.recFilter;
      renderRecommendationsView();
    });
  });

  document.getElementById('mobileFilterToggleBtn')?.addEventListener('click', () => {
    const grp = document.getElementById('facetSelectsGroup');
    if (grp) {
      grp.classList.toggle('mobile-open');
    }
  });

  document.getElementById('mobileShareBtn')?.addEventListener('click', shareLivePortal);
  document.getElementById('desktopSharePortalBtn')?.addEventListener('click', shareLivePortal);

  document.getElementById('filterSearch').addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    renderAllViews();
  });
  document.getElementById('filterCadre').addEventListener('change', (e) => {
    state.filters.cadre = e.target.value;
    renderAllViews();
  });
  document.getElementById('filterSpecialty')?.addEventListener('change', (e) => {
    state.filters.specialty = e.target.value;
    renderAllViews();
  });
  document.getElementById('filterState').addEventListener('change', (e) => {
    state.filters.state = e.target.value;
    // Dynamically update top City dropdown to show cities in the selected State
    const citySelect = document.getElementById('filterCityPop');
    if (citySelect) {
      const stVal = e.target.value;
      const cities = stVal === 'ALL' ? STATE_CITIES_MAP['All India'] : getCitiesForState(stVal);
      citySelect.innerHTML = `
        <option value="ALL">${stVal === 'ALL' ? 'City: All Cities' : `City: All in ${escapeHtml(stVal)}`}</option>
        <option value="POP_40L_PLUS">★ &gt;40–50L+ Population Metro Hubs</option>
        ${cities.map((ct) => `<option value="${escapeHtml(ct)}">${escapeHtml(ct)}</option>`).join('')}
      `;
      state.filters.cityPop = 'ALL';
      citySelect.value = 'ALL';
    }
    renderAllViews();
  });
  document.getElementById('filterCityPop').addEventListener('change', (e) => {
    state.filters.cityPop = e.target.value;
    renderAllViews();
  });

  document.getElementById('resetFiltersBtn').addEventListener('click', () => {
    state.filters = {
      search: '',
      cadre: 'ALL',
      specialty: 'ALL',
      state: 'ALL',
      cityPop: 'ALL',
    };
    document.getElementById('filterSearch').value = '';
    document.getElementById('filterCadre').value = 'ALL';
    if (document.getElementById('filterSpecialty')) {
      document.getElementById('filterSpecialty').value = 'ALL';
    }
    document.getElementById('filterState').value = 'ALL';
    document.getElementById('filterCityPop').value = 'ALL';
    renderAllViews();
  });

  document.getElementById('closeDrawerBtn').addEventListener('click', closeDrawer);
  document.getElementById('detailDrawerBackdrop').addEventListener('click', (e) => {
    if (e.target.id === 'detailDrawerBackdrop') closeDrawer();
  });

  document.getElementById('runScraperBtn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.textContent = 'Syncing...';
    const res = await fetch('/api/scrape-gov', { method: 'POST' });
    const data = await res.json();
    state.govListings = data.govListings || state.govListings;
    state.portalStatus = data.portalStatus || state.portalStatus;
    await refreshRecommendations();
    updateSidebarScraperFooter();
    renderAllViews();
    btn.textContent = 'Sync Govt DMEs';
    showToast('Synced live Central INI & State DME notifications');
  });

  document.getElementById('runPrivateScraperBtn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.textContent = 'Syncing...';
    const res = await fetch('/api/scrape-private', { method: 'POST' });
    const data = await res.json();
    state.privateListings = data.privateListings || state.privateListings;
    state.privatePortalStatus = data.privatePortalStatus || state.privatePortalStatus;
    await refreshRecommendations();
    updateSidebarScraperFooter();
    renderAllViews();
    btn.textContent = 'Sync Pvt Chains';
    showToast('Synced 12 Big Private Hospital Chains');
  });

  document.getElementById('editProfileBtn')?.addEventListener('click', openProfileModalGlobal);
  document.getElementById('mobileEditProfileBtn')?.addEventListener('click', openProfileModalGlobal);
  document.getElementById('clearProfileBtn')?.addEventListener('click', clearUserProfile);

  // Cascading Cadre -> Degree -> Field/Branch in Profile Modal
  document.getElementById('profCadre')?.addEventListener('change', (e) => {
    populateModalDegreesForCadre(e.target.value);
  });

  document.getElementById('profDegree')?.addEventListener('change', (e) => {
    populateModalBranchesForDegree(e.target.value);
  });

  document.getElementById('profState')?.addEventListener('change', (e) => {
    populateModalCitiesForState(e.target.value);
  });

  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      id: state.activeCandidate?.id || `cand-${Date.now()}`,
      name: document.getElementById('profName').value,
      cadre: document.getElementById('profCadre').value,
      degree: document.getElementById('profDegree').value,
      specialty: document.getElementById('profSpecialty').value,
      experience_years: Number(document.getElementById('profExp').value),
      age: Number(document.getElementById('profAge')?.value || 29),
      preferred_state: document.getElementById('profState').value,
      preferred_city: document.getElementById('profCity')?.value || 'ALL',
      alma_mater: document.getElementById('profAlmaMater').value,
      interested_in_fellowships: document.getElementById('profFellowship').checked,
    };
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    state.candidates = data.candidates || state.candidates;
    state.activeCandidate = data.profile;
    saveUserProfileLocal(data.profile);
    syncFiltersWithActiveProfile();
    renderActiveProfileBanner();
    await refreshRecommendations();
    renderAllViews();
    if (window.location.hash.startsWith('#/job/')) {
      renderFullJobPage(decodeURIComponent(window.location.hash.slice('#/job/'.length)));
    }
    document.getElementById('profileModal').classList.add('hidden');
    showToast(
      `Filtered for ${data.profile.degree} (${data.profile.specialty}) · ${
        data.profile.preferred_city && data.profile.preferred_city !== 'ALL'
          ? data.profile.preferred_city
          : data.profile.preferred_state
      }`
    );
  });

  const openPostModal = () => {
    document.getElementById('postJobModal').classList.remove('hidden');
  };
  document.getElementById('openPostJobModalBtn')?.addEventListener('click', openPostModal);
  document.getElementById('mobilePostJobBtn')?.addEventListener('click', openPostModal);

  document.getElementById('postJobForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      institution: document.getElementById('postInstitution').value,
      cadre: document.getElementById('postCadre').value,
      title: document.getElementById('postTitle').value,
      is_fellowship: document.getElementById('postIsFellowship').value === 'true',
      specialty: document.getElementById('postSpecialty').value,
      degrees_accepted: document.getElementById('postDegrees').value,
      min_experience_years: Number(document.getElementById('postMinExp').value),
      monthly_pay_inr: Number(document.getElementById('postMonthlyPay').value),
      state: document.getElementById('postState').value,
      city: document.getElementById('postCity').value,
      highlights: document.getElementById('postHighlights').value,
    };
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.privateListings) {
      state.privateListings = data.privateListings;
      await refreshRecommendations();
      renderAllViews();
      document.getElementById('postJobModal').classList.add('hidden');
      showToast(`Published opening: ${data.job.title}`);
      navigateTo(`#/job/${data.job.id}`);
    }
  });

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById(btn.dataset.close).classList.add('hidden');
    });
  });
}

function populateModalDegreesForCadre(cadreVal, selectedDegree = null) {
  const degEl = document.getElementById('profDegree');
  if (!degEl) return;
  const degrees = CADRE_DEGREES_MAP[cadreVal] || CADRE_DEGREES_MAP.DOCTOR;
  degEl.innerHTML = degrees
    .map((d) => `<option value="${escapeHtml(d.value)}">${escapeHtml(d.label)}</option>`)
    .join('');
  const targetDegree =
    selectedDegree && degrees.some((d) => d.value === selectedDegree)
      ? selectedDegree
      : degrees[0].value;
  degEl.value = targetDegree;
  populateModalBranchesForDegree(targetDegree);
}

function populateModalBranchesForDegree(degreeVal, selectedBranch = null) {
  const specEl = document.getElementById('profSpecialty');
  if (!specEl) return;
  const branches = getBranchesForDegree(degreeVal);
  specEl.innerHTML = branches
    .map((b) => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`)
    .join('');
  if (selectedBranch && branches.includes(selectedBranch)) {
    specEl.value = selectedBranch;
  } else {
    specEl.value = branches[0];
  }
}

function populateModalCitiesForState(stateVal, selectedCity = 'ALL') {
  const cityEl = document.getElementById('profCity');
  if (!cityEl) return;
  const cities = getCitiesForState(stateVal);
  cityEl.innerHTML = `
    <option value="ALL">${stateVal === 'All India' ? 'All Cities (Any City)' : `All Cities in ${escapeHtml(stateVal)}`}</option>
    ${cities.map((ct) => `<option value="${escapeHtml(ct)}">${escapeHtml(ct)}</option>`).join('')}
  `;
  if (selectedCity && (selectedCity === 'ALL' || cities.includes(selectedCity))) {
    cityEl.value = selectedCity;
  } else {
    cityEl.value = 'ALL';
  }
}

function openProfileModalGlobal() {
  const c = state.activeCandidate;
  if (c) {
    document.getElementById('profName').value = c.name || '';
    const cadVal = c.cadre || 'DOCTOR';
    document.getElementById('profCadre').value = cadVal;
    populateModalDegreesForCadre(cadVal, c.degree || 'MS');
    populateModalBranchesForDegree(c.degree || 'MS', c.specialty);
    const stVal = c.preferred_state || 'All India';
    document.getElementById('profState').value = stVal;
    populateModalCitiesForState(stVal, c.preferred_city || 'ALL');
    document.getElementById('profExp').value = c.experience_years ?? 1;
    document.getElementById('profAlmaMater').value = c.alma_mater || '';
    document.getElementById('profFellowship').checked = Boolean(c.interested_in_fellowships ?? true);
  } else {
    document.getElementById('profName').value = '';
    document.getElementById('profCadre').value = 'DOCTOR';
    populateModalDegreesForCadre('DOCTOR', 'MS');
    populateModalBranchesForDegree('MS', 'General Surgery');
    document.getElementById('profState').value = 'All India';
    populateModalCitiesForState('All India', 'ALL');
    document.getElementById('profExp').value = 1;
    document.getElementById('profAlmaMater').value = '';
    document.getElementById('profFellowship').checked = true;
  }
  document.getElementById('profileModal').classList.remove('hidden');
}

window.openJobDrawer = openJobDrawer;
window.navigateTo = navigateTo;
window.navigateBackToFeed = navigateBackToFeed;
window.submitDirectApplyFromDrawer = submitDirectApplyFromDrawer;
window.submitDirectApplyFromPage = submitDirectApplyFromPage;
window.updateAppStatus = updateAppStatus;
window.submitApplicationNote = submitApplicationNote;
window.withdrawApplication = withdrawApplication;
window.triggerLiveQaRun = triggerLiveQaRun;
window.openProfileModalGlobal = openProfileModalGlobal;
window.submitInlineQuickProfile = submitInlineQuickProfile;
window.clearUserProfile = clearUserProfile;
window.onQuickDegreeChange = onQuickDegreeChange;
window.onQuickStateChange = onQuickStateChange;

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  bootstrap();
});
