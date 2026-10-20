/**
 * MedVantage India — Multi-Cadre Qualification, Branch & City Recommendation Engine
 * (`backend/matching_engine.js`)
 *
 * Implements strict Degree -> Branch/Specialty -> City/State eligibility & filtering:
 * - Supports Allopathic Doctors (`DOCTOR`: MBBS, MD, MS, DNB, DM, MCh),
 *   Dental Professionals (`DENTAL`: BDS, MDS),
 *   Nurses (`NURSING`: B.Sc Nursing, M.Sc Nursing, Post-Basic B.Sc, GNM, ANM),
 *   and Fellowships (`is_fellowship: true` across all 3 cadres).
 * - Matches across both Live Government / State DME notifications and Private Hospital Direct-Apply openings.
 */

'use strict';

const DEGREE_LEVELS = {
  DOCTOR: {
    MBBS: 1,
    MD: 2,
    MS: 2,
    DNB: 2,
    DM: 3,
    MCH: 3,
    FNB: 3,
  },
  DENTAL: {
    BDS: 1,
    MDS: 2,
  },
  NURSING: {
    ANM: 1,
    GNM: 2,
    'B.SC NURSING': 3,
    'BSC NURSING': 3,
    'B.SC': 3,
    'POST-BASIC B.SC': 3,
    'POST BASIC B.SC': 3,
    'M.SC NURSING': 4,
    'MSC NURSING': 4,
    'M.SC': 4,
  },
};

function normalizeDegree(rawDegree) {
  if (!rawDegree) return '';
  const d = String(rawDegree).trim().toUpperCase();
  if (d === 'M.CH' || d === 'MCH') return 'MCH';
  if (d === 'D.M.' || d === 'DM') return 'DM';
  if (d === 'M.D.' || d === 'MD') return 'MD';
  if (d === 'M.S.' || d === 'MS') return 'MS';
  if (d.includes('POST') && d.includes('BASIC')) return 'POST-BASIC B.SC';
  if (d.includes('M.SC') || d.includes('MSC')) return 'M.SC NURSING';
  if (d.includes('B.SC') || d.includes('BSC')) return 'B.SC NURSING';
  return d;
}

function inferCadreFromDegree(degree) {
  const norm = normalizeDegree(degree);
  if (['BDS', 'MDS'].includes(norm)) return 'DENTAL';
  if (['ANM', 'GNM', 'B.SC NURSING', 'POST-BASIC B.SC', 'M.SC NURSING'].includes(norm)) {
    return 'NURSING';
  }
  return 'DOCTOR';
}

const SPECIALTY_SYNONYM_GROUPS = [
  ['general medicine', 'internal medicine', 'diabetology', 'metabolic', 'infectious', 'physician'],
  ['general surgery', 'laparoscopic', 'minimal access', 'gastrointestinal surgery', 'surgical', 'trauma surgery'],
  ['orthopedics', 'orthopaedics', 'joint replacement', 'arthroplasty', 'sports medicine', 'spine'],
  ['obstetrics', 'gynecology', 'obgyn', 'obg', 'fetomaternal', 'maternity', 'reproductive', 'ivf'],
  ['pediatrics', 'paediatrics', 'neonatology', 'nicu', 'picu', 'child health', 'pediatric cardiac'],
  ['radiology', 'radio-diagnosis', 'radiodiagnosis', 'imaging', 'mri', 'ct', 'interventional radiology'],
  ['anesthesiology', 'anesthesia', 'critical care', 'icu', 'intensive care', 'pain', 'palliative', 'ecmo'],
  ['emergency medicine', 'emergency', 'casualty', 'trauma', 'rmo', 'gdmo', 'general practice', 'medical officer'],
  ['dermatology', 'venereology', 'skin', 'cosmetology'],
  ['ophthalmology', 'eye', 'cataract', 'retina'],
  ['ent', 'otorhinolaryngology', 'head & neck', 'otolaryngology'],
  ['pulmonary medicine', 'respiratory', 'chest', 'tb', 'pulmonology'],
  ['cardiology', 'cardiac', 'ctvs', 'cardiothoracic', 'interventional cardiology'],
  ['gastroenterology', 'hepatology', 'gi endoscopy', 'endoscopy'],
  ['nephrology', 'dialysis', 'renal'],
  ['neurology', 'neurosurgery', 'neuro-critical', 'stroke'],
  ['oncology', 'surgical oncology', 'medical oncology', 'radiation oncology'],
  ['oral & maxillofacial surgery', 'maxillofacial', 'oral surgery', 'facial trauma', 'onco-reconstruction'],
  ['conservative dentistry', 'endodontics', 'root canal', 'micro-endodontics', 'aesthetic dentistry'],
  ['prosthodontics', 'implantology', 'oral implantology', 'crown', 'bridge', 'full-mouth'],
  ['orthodontics', 'aligners', 'dentofacial'],
  ['periodontology', 'periodontics', 'pedodontics', 'pediatric dentistry', 'public health dentistry', 'general dentistry', 'dental surgeon', 'dentistry'],
  ['critical care nursing', 'icu nursing', 'nicu', 'picu', 'emergency nursing', 'trauma nursing', 'stroke icu'],
  ['ot nursing', 'operation theatre', 'surgical nursing', 'perioperative'],
  ['medical-surgical nursing', 'general ward', 'staff nurse', 'nursing officer', 'dialysis', 'obstetrics & labour'],
  ['nursing education', 'nursing administration', 'infection control', 'nursing tutor', 'clinical instructor', 'supervision'],
];

/**
 * Evaluates whether a listing's specialty matches the clinician's selected branch/specialty.
 * Returns { score, badge, isSpecialtyMatch } so non-matching specialties can be strictly separated!
 */
function evaluateSpecialtyFit(candidateSpecialty, listingSpecialty, listingTitle, listingRoleCategory) {
  const candSpec = String(candidateSpecialty || '').trim().toLowerCase();
  const listSpec = String(listingSpecialty || '').trim().toLowerCase();
  const listContext = `${listSpec} ${String(listingTitle || '').toLowerCase()} ${String(listingRoleCategory || '').toLowerCase()}`;

  if (!candSpec || candSpec === 'all' || candSpec === 'any') {
    return {
      score: 90,
      badge: `Specialty: ${listingSpecialty || 'Multi-Specialty'}`,
      isSpecialtyMatch: true,
    };
  }

  // Direct substring match (e.g. "Orthopedics" in "General Medicine, Orthopedics, Pediatrics")
  if (
    listSpec.includes(candSpec) ||
    candSpec.includes(listSpec) ||
    listContext.includes(candSpec)
  ) {
    return {
      score: 100,
      badge: `Exact Branch Match: ${candidateSpecialty}`,
      isSpecialtyMatch: true,
    };
  }

  // Token / synonym group match (e.g., "General Surgery" matches "Laparoscopic Surgery", "OBGYN" matches "Obstetrics & Gynecology")
  for (const group of SPECIALTY_SYNONYM_GROUPS) {
    const candInGroup = group.some((kw) => candSpec.includes(kw));
    const listInGroup = group.some((kw) => listContext.includes(kw));
    if (candInGroup && listInGroup) {
      return {
        score: 94,
        badge: `Aligned Branch (${candidateSpecialty})`,
        isSpecialtyMatch: true,
      };
    }
  }

  // Multi-department Govt/DME advertisements that explicitly say "All Broad Specialties" or "All Departments"
  if (listSpec.includes('all ') || listSpec.includes('multi-specialty')) {
    return {
      score: 84,
      badge: `Multi-Department Notification (${listingSpecialty})`,
      isSpecialtyMatch: true,
    };
  }

  return { score: 15, badge: null, isSpecialtyMatch: false };
}

function scoreListingForCandidate(candidate = {}, listing = {}) {
  const reasons = [];

  const candidateDegreeRaw =
    candidate.degree ||
    candidate.highest_degree ||
    (Array.isArray(candidate.degrees) ? candidate.degrees[0] : '') ||
    'MBBS';
  const candidateDegree = normalizeDegree(candidateDegreeRaw);
  const candidateCadre = String(
    candidate.cadre || inferCadreFromDegree(candidateDegree)
  ).toUpperCase();

  const candidateExp = Number(
    candidate.experience_years ??
      candidate.years_of_experience ??
      candidate.experienceYears ??
      0
  );
  const candidateAge = Number(candidate.age ?? candidate.age_years ?? 30);
  const candidateSpecialty =
    candidate.specialty || candidate.department || candidate.specialization || '';
  const candidateState = String(
    candidate.preferred_state || candidate.state || ''
  ).trim();
  const candidateCity = String(candidate.preferred_city || candidate.city || '').trim();

  const wantsFellowship = Boolean(
    candidate.interested_in_fellowships ??
      candidate.fellowship_interest ??
      candidate.wants_fellowship ??
      true
  );

  const listingCadre = String(listing.cadre || 'DOCTOR').toUpperCase();
  const acceptedDegrees = Array.isArray(listing.degrees_accepted)
    ? listing.degrees_accepted.map(normalizeDegree)
    : [];
  const minExp = Number(listing.min_experience_years ?? 0);
  const maxAge = Number(listing.max_age_years ?? 65);
  const isFellowship = Boolean(listing.is_fellowship);
  const isPrivate =
    String(listing.institution_type || '').startsWith('PRIVATE') ||
    String(listing.application_mode || '').toLowerCase().includes('direct');

  if (candidateCadre !== listingCadre) {
    return {
      score: 10,
      matchTier: 'EXPLORE',
      reasons: [`Different Healthcare Cadre (${listingCadre})`],
      eligible: false,
      degreeEligible: false,
      specialtyEligible: false,
      locationMatch: false,
      breakdown: {
        cadre_degree: 0,
        specialty: 0,
        experience: 0,
        location: 0,
        track_preference: 0,
      },
    };
  }

  // 1. Strict Degree Check:
  // Do NOT treat MS (Surgical) as eligible for an MD-only (Medical) role unless the listing accepts MS or DNB!
  let sCadreDegree = 0;
  let degreeEligible = false;

  const cadreMap = DEGREE_LEVELS[candidateCadre] || DEGREE_LEVELS.DOCTOR;
  const candLevel = cadreMap[candidateDegree] || 1;
  const acceptedLevels = acceptedDegrees
    .map((d) => cadreMap[d] || 1)
    .filter(Boolean);
  const minRequiredLevel = acceptedLevels.length
    ? Math.min(...acceptedLevels)
    : 1;

  const exactDegreeMatch = acceptedDegrees.includes(candidateDegree);
  const dnbEquivalentMatch =
    candidateCadre === 'DOCTOR' &&
    candidateDegree === 'DNB' &&
    acceptedDegrees.some((d) => ['MD', 'MS', 'DNB'].includes(d));
  const superSpecMatch =
    candidateCadre === 'DOCTOR' &&
    ((candidateDegree === 'MCH' && acceptedDegrees.includes('MS')) ||
      (candidateDegree === 'DM' && acceptedDegrees.includes('MD')));
  const nursingBscEquivalent =
    candidateCadre === 'NURSING' &&
    ['B.SC NURSING', 'POST-BASIC B.SC', 'M.SC NURSING'].includes(candidateDegree) &&
    acceptedDegrees.some((d) => ['B.SC NURSING', 'POST-BASIC B.SC', 'GNM'].includes(d));
  const dentalMdsForBds =
    candidateCadre === 'DENTAL' &&
    candidateDegree === 'MDS' &&
    acceptedDegrees.includes('BDS');

  if (exactDegreeMatch) {
    sCadreDegree = 100;
    degreeEligible = true;
    reasons.push(`Degree Eligible (${candidateDegreeRaw})`);
  } else if (dnbEquivalentMatch || superSpecMatch || nursingBscEquivalent || dentalMdsForBds) {
    sCadreDegree = 94;
    degreeEligible = true;
    reasons.push(`Qualification Eligible (${candidateDegreeRaw})`);
  } else if (acceptedDegrees.includes('MBBS') && candLevel >= 1 && candidateCadre === 'DOCTOR') {
    sCadreDegree = 84;
    degreeEligible = true;
    reasons.push(`Eligible (${candidateDegreeRaw})`);
  } else {
    sCadreDegree = 15;
    degreeEligible = false;
  }

  // 2. Specialty / Branch Check:
  const specEval = evaluateSpecialtyFit(
    candidateSpecialty,
    listing.specialty,
    listing.title,
    listing.role_category
  );
  const sSpecialty = specEval.score;
  const specialtyEligible = specEval.isSpecialtyMatch;
  if (specEval.badge) {
    reasons.push(specEval.badge);
  }

  // 3. Experience & Age Check:
  let sExperience = 0;
  let expEligible = true;

  if (candidateExp >= minExp) {
    sExperience = 100;
    reasons.push(
      minExp === 0
        ? `Fresher / 0+ Yrs Eligible`
        : `Experience Fit (${candidateExp} yrs vs ${minExp}+ req)`
    );
  } else {
    const deficit = minExp - candidateExp;
    if (deficit === 1) {
      sExperience = 65;
      expEligible = true; // allow 1-year stretch roles if degree & branch match
      reasons.push(`Requires ${minExp}+ yrs exp`);
    } else {
      sExperience = 25;
      expEligible = false;
    }
  }

  const ageEligible = candidateAge <= maxAge;

  // 4. Location (City & State) Check:
  let sLocation = 60;
  let locationMatch = true;
  const listingState = String(listing.state || '').trim();
  const listingCity = String(listing.city || '').trim();

  const hasCityPref =
    candidateCity &&
    candidateCity.toLowerCase() !== 'all' &&
    candidateCity.toLowerCase() !== 'any';
  const hasStatePref =
    candidateState &&
    candidateState.toLowerCase() !== 'all india' &&
    candidateState.toLowerCase() !== 'all' &&
    candidateState.toLowerCase() !== 'any';

  if (hasCityPref) {
    if (
      listingCity.toLowerCase().includes(candidateCity.toLowerCase()) ||
      listingState.toLowerCase().includes(candidateCity.toLowerCase())
    ) {
      sLocation = 100;
      locationMatch = true;
      reasons.push(`City Match: ${listingCity || listingState}`);
    } else {
      sLocation = 35;
      locationMatch = false;
    }
  } else if (hasStatePref) {
    if (
      listingState.toLowerCase() === candidateState.toLowerCase() ||
      listingState.toLowerCase() === 'all india'
    ) {
      sLocation = 100;
      locationMatch = true;
      reasons.push(`State Match: ${listingState}`);
    } else {
      sLocation = 45;
      locationMatch = false;
    }
  }

  // 5. Track Check:
  let sTrack = isPrivate ? 92 : 92;
  if (isFellowship && wantsFellowship) {
    sTrack = 100;
    reasons.push('Fellowship Track');
  }

  // Eligible requires Degree + Specialty/Branch + Experience!
  const eligible = Boolean(degreeEligible && specialtyEligible && expEligible && ageEligible);

  let rawScore =
    0.35 * sCadreDegree +
    0.35 * sSpecialty +
    0.15 * sExperience +
    0.10 * sLocation +
    0.05 * sTrack;

  if (!eligible) {
    rawScore = Math.min(rawScore, 55);
  }

  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  let matchTier = 'EXPLORE';
  if (eligible && score >= 85) {
    matchTier = 'TOP_MATCH';
  } else if (eligible && score >= 70) {
    matchTier = 'STRONG_MATCH';
  } else if (eligible) {
    matchTier = 'ELIGIBLE';
  }

  return {
    score,
    matchTier,
    reasons: reasons.slice(0, 5),
    eligible,
    degreeEligible,
    specialtyEligible,
    locationMatch,
    breakdown: {
      cadre_degree: Math.round(sCadreDegree),
      specialty: Math.round(sSpecialty),
      experience: Math.round(sExperience),
      location: Math.round(sLocation),
      track_preference: Math.round(sTrack),
    },
  };
}

function getRecommendationsForCandidate(candidate = {}, allListings = [], options = {}) {
  const {
    onlyEligible = false,
    onlyFellowships = false,
    excludeFellowships = false,
    sector = null,
    cadreFilter = true,
    limit = 100,
  } = options;

  const candidateDegree = normalizeDegree(
    candidate.degree || candidate.highest_degree || 'MBBS'
  );
  const candidateCadre = String(
    candidate.cadre || inferCadreFromDegree(candidateDegree)
  ).toUpperCase();

  const scored = [];

  for (const listing of allListings) {
    if (!listing) continue;

    if (cadreFilter && String(listing.cadre || '').toUpperCase() !== candidateCadre) {
      continue;
    }
    if (onlyFellowships && !listing.is_fellowship) {
      continue;
    }
    if (excludeFellowships && listing.is_fellowship) {
      continue;
    }
    if (sector === 'PRIVATE') {
      const isPvt = String(listing.institution_type || '').startsWith('PRIVATE');
      if (!isPvt) continue;
    } else if (sector === 'GOVT') {
      const isPvt = String(listing.institution_type || '').startsWith('PRIVATE');
      if (isPvt) continue;
    }

    const evaluation = scoreListingForCandidate(candidate, listing);
    if (onlyEligible && !evaluation.eligible) {
      continue;
    }

    scored.push({
      ...listing,
      matchScore: evaluation.score,
      matchTier: evaluation.matchTier,
      matchReasons: evaluation.reasons,
      eligible: evaluation.eligible,
      degreeEligible: evaluation.degreeEligible,
      specialtyEligible: evaluation.specialtyEligible,
      locationMatch: evaluation.locationMatch,
      matchBreakdown: evaluation.breakdown,
      _match: evaluation,
    });
  }

  scored.sort((a, b) => {
    if (b.eligible !== a.eligible) return b.eligible ? 1 : -1;
    if (b.locationMatch !== a.locationMatch) return b.locationMatch ? 1 : -1;
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return (b.monthly_pay_inr || 0) - (a.monthly_pay_inr || 0);
  });

  return scored.slice(0, limit);
}

module.exports = {
  scoreListingForCandidate,
  getRecommendationsForCandidate,
  normalizeDegree,
  inferCadreFromDegree,
  DEGREE_LEVELS,
};
