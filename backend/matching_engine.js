/**
 * MedVantage India — Multi-Cadre Qualification & Experience Recommendation Engine
 * (`backend/matching_engine.js`)
 *
 * Implements `.agents/skills/doctor-job-matching/SKILL.md`:
 * - Supports Allopathic Doctors (`DOCTOR`: MBBS, MD, MS, DNB, DM, MCh),
 *   Dental Professionals (`DENTAL`: BDS, MDS),
 *   Nurses (`NURSING`: B.Sc Nursing, M.Sc Nursing, Post-Basic B.Sc, GNM, ANM),
 *   and Fellowships (`is_fellowship: true` across all 3 cadres).
 * - Matches across both Live Government / State DME notifications and Private Hospital Direct-Apply openings.
 * - Composite Match Score (0 - 100):
 *   MatchScore = 0.35 * S_cadre_degree + 0.25 * S_specialty + 0.20 * S_experience + 0.10 * S_location + 0.10 * S_track_preference
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
  ['general medicine', 'internal medicine', 'medicine', 'diabetology', 'metabolic', 'general practice', 'gdmo', 'rmo'],
  ['critical care', 'icu', 'intensive care', 'anesthesiology', 'anesthesia', 'emergency', 'trauma', 'pulmonary', 'ecmo'],
  ['pediatrics', 'paediatrics', 'neonatology', 'nicu', 'picu', 'child health', 'pediatric cardiac'],
  ['orthopedics', 'orthopaedics', 'joint replacement', 'arthroplasty', 'sports medicine', 'spine', 'trauma surgery'],
  ['obstetrics', 'gynecology', 'obgyn', 'obg', 'fetomaternal', 'maternity', 'reproductive', 'ivf'],
  ['radiology', 'radio-diagnosis', 'radiodiagnosis', 'imaging', 'mri', 'ct', 'interventional radiology'],
  ['general surgery', 'surgery', 'minimal access', 'laparoscopic', 'gastrointestinal surgery'],
  ['cardiology', 'cardiac', 'ctvs', 'cardiothoracic'],
  ['endodontics', 'conservative dentistry', 'root canal', 'general dentistry', 'dental surgeon', 'aesthetic dentistry'],
  ['prosthodontics', 'implantology', 'crown', 'bridge', 'full-mouth', 'oral implantology'],
  ['oral & maxillofacial surgery', 'maxillofacial', 'oral surgery', 'facial trauma'],
  ['orthodontics', 'aligners', 'dentofacial'],
  ['critical care nursing', 'icu nursing', 'nicu nursing', 'emergency nursing', 'ot nursing', 'operation theatre', 'staff nurse', 'nursing officer'],
  ['infection control', 'nursing administration', 'nursing supervisor', 'nurse educator', 'nursing tutor', 'medical-surgical'],
];

function evaluateSpecialtyFit(candidateSpecialty, listingSpecialty, listingTitle, listingRoleCategory) {
  const candSpec = String(candidateSpecialty || '').trim().toLowerCase();
  const listSpec = String(listingSpecialty || '').trim().toLowerCase();
  const listContext = `${listSpec} ${String(listingTitle || '').toLowerCase()} ${String(listingRoleCategory || '').toLowerCase()}`;

  if (!candSpec || candSpec === 'all' || candSpec === 'any') {
    return { score: 80, badge: `Broad Specialty Fit (${listingSpecialty || 'Multi-Specialty'})` };
  }

  if (
    listSpec.includes(candSpec) ||
    candSpec.includes(listSpec) ||
    listContext.includes(candSpec)
  ) {
    return { score: 100, badge: `Exact Specialty Match: ${listingSpecialty}` };
  }

  if (
    listSpec.includes('all ') ||
    listSpec.includes('multi') ||
    listSpec.includes('general') ||
    candSpec.includes('general')
  ) {
    for (const group of SPECIALTY_SYNONYM_GROUPS) {
      const candInGroup = group.some((kw) => candSpec.includes(kw));
      const listInGroup = group.some((kw) => listContext.includes(kw));
      if (candInGroup && listInGroup) {
        return { score: 92, badge: `Aligned Clinical Specialty (${listingSpecialty})` };
      }
    }
    return { score: 78, badge: `General / Broad Specialty Opening (${listingSpecialty})` };
  }

  for (const group of SPECIALTY_SYNONYM_GROUPS) {
    const candInGroup = group.some((kw) => candSpec.includes(kw));
    const listInGroup = group.some((kw) => listContext.includes(kw));
    if (candInGroup && listInGroup) {
      return { score: 88, badge: `Related Specialty Track (${listingSpecialty})` };
    }
  }

  return { score: 35, badge: null };
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
  const candidateStatesList = Array.isArray(candidate.preferred_states)
    ? candidate.preferred_states.map((s) => String(s).trim().toLowerCase())
    : candidateState
    ? [candidateState.toLowerCase()]
    : [];
  const candidateCity = String(candidate.preferred_city || candidate.city || '')
    .trim()
    .toLowerCase();

  const wantsFellowship = Boolean(
    candidate.interested_in_fellowships ??
      candidate.fellowship_interest ??
      candidate.wants_fellowship ??
      (String(candidate.role_preference || candidate.preferred_role_type || '')
        .toLowerCase()
        .includes('fellowship'))
  );
  const preferredSector = String(
    candidate.preferred_sector || candidate.sector_preference || 'ALL'
  ).toUpperCase();

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

  let sCadreDegree = 0;
  let degreeEligible = false;

  if (candidateCadre !== listingCadre) {
    return {
      score: 12,
      matchTier: 'EXPLORE',
      reasons: [`Different Healthcare Cadre (${listingCadre})`],
      eligible: false,
      breakdown: {
        cadre_degree: 0,
        specialty: 0,
        experience: 0,
        location: 0,
        track_preference: 0,
      },
    };
  }

  const cadreMap = DEGREE_LEVELS[candidateCadre] || DEGREE_LEVELS.DOCTOR;
  const candLevel = cadreMap[candidateDegree] || 1;
  const acceptedLevels = acceptedDegrees
    .map((d) => cadreMap[d] || 1)
    .filter(Boolean);
  const minRequiredLevel = acceptedLevels.length
    ? Math.min(...acceptedLevels)
    : 1;
  const maxAcceptedLevel = acceptedLevels.length
    ? Math.max(...acceptedLevels)
    : 3;

  const exactDegreeMatch = acceptedDegrees.includes(candidateDegree);
  const pgEquivalentMatch =
    candidateCadre === 'DOCTOR' &&
    ['MD', 'MS', 'DNB'].includes(candidateDegree) &&
    acceptedDegrees.some((d) => ['MD', 'MS', 'DNB'].includes(d));
  const nursingBscEquivalent =
    candidateCadre === 'NURSING' &&
    ['B.SC NURSING', 'POST-BASIC B.SC'].includes(candidateDegree) &&
    acceptedDegrees.some((d) => ['B.SC NURSING', 'POST-BASIC B.SC'].includes(d));

  if (exactDegreeMatch) {
    sCadreDegree = 100;
    degreeEligible = true;
    reasons.push(`Qualification Match (${candidateDegreeRaw})`);
  } else if (pgEquivalentMatch || nursingBscEquivalent) {
    sCadreDegree = 95;
    degreeEligible = true;
    reasons.push(`Equivalent Qualification Eligible (${candidateDegreeRaw})`);
  } else if (candLevel > maxAcceptedLevel) {
    sCadreDegree = 82;
    degreeEligible = true;
    reasons.push(`Higher Qualification Eligible (${candidateDegreeRaw})`);
  } else if (candLevel >= minRequiredLevel) {
    sCadreDegree = 85;
    degreeEligible = true;
    reasons.push(`Cadre & Degree Level Eligible (${candidateDegreeRaw})`);
  } else {
    sCadreDegree = 20;
    degreeEligible = false;
  }

  const specEval = evaluateSpecialtyFit(
    candidateSpecialty,
    listing.specialty,
    listing.title,
    listing.role_category
  );
  const sSpecialty = specEval.score;
  if (specEval.badge) {
    reasons.push(specEval.badge);
  }

  let sExperience = 0;
  let expEligible = true;

  if (candidateExp >= minExp) {
    const expGap = candidateExp - minExp;
    if (expGap <= 4) {
      sExperience = 100;
      reasons.push(
        minExp === 0
          ? `Fresher / Early-Career Friendly (${candidateExp} yr exp)`
          : `Experience Fit (${candidateExp}+ yrs vs ${minExp} yr req)`
      );
    } else if (expGap <= 8) {
      sExperience = 88;
      reasons.push(`Strong Experience Profile (${candidateExp} yrs)`);
    } else {
      sExperience = isFellowship ? 70 : 76;
    }
  } else {
    const deficit = minExp - candidateExp;
    if (deficit === 1) {
      sExperience = 55;
      expEligible = false;
      reasons.push(`Stretch Role (Requires ${minExp} yrs exp)`);
    } else {
      sExperience = 20;
      expEligible = false;
    }
  }

  const ageEligible = candidateAge <= maxAge;
  if (!ageEligible) {
    sExperience = Math.max(10, sExperience - 40);
  }

  let sLocation = 60;
  const listingState = String(listing.state || '').trim();
  const listingCity = String(listing.city || '').trim();

  if (
    candidateCity &&
    listingCity.toLowerCase().includes(candidateCity)
  ) {
    sLocation = 100;
    reasons.push(`Preferred City (${listingCity})`);
  } else if (
    candidateStatesList.length > 0 &&
    (candidateStatesList.includes(listingState.toLowerCase()) ||
      candidateStatesList.includes('all india') ||
      candidateStatesList.includes('any'))
  ) {
    sLocation = 100;
    reasons.push(`Preferred State (${listingState})`);
  } else if (
    String(listing.institution_type || '').includes('CENTRAL') ||
    String(listing.application_mode || '').includes('Direct Apply')
  ) {
    sLocation = 72;
  }

  let sTrack = 75;

  if (isFellowship) {
    if (wantsFellowship) {
      sTrack = 100;
      reasons.push('Matches Fellowship & Skill-Enhancement Track');
    } else if (candidateExp <= 3) {
      sTrack = 92;
      reasons.push('Recommended Early-Career Fellowship Track');
    } else {
      sTrack = 65;
    }
  } else {
    if (preferredSector === 'PRIVATE' && isPrivate) {
      sTrack = 100;
      reasons.push('1-Click Direct Apply (Private Hospital Track)');
    } else if (
      (preferredSector === 'GOVT' || preferredSector === 'GOVERNMENT') &&
      !isPrivate
    ) {
      sTrack = 100;
      reasons.push('Matches Govt / State DME Career Track');
    } else if (isPrivate) {
      sTrack = 88;
      reasons.push('1-Click Direct Apply');
    } else {
      sTrack = 88;
      reasons.push('Verified Govt / DME Notification');
    }
  }

  let rawScore =
    0.35 * sCadreDegree +
    0.25 * sSpecialty +
    0.20 * sExperience +
    0.10 * sLocation +
    0.10 * sTrack;

  if (isFellowship && wantsFellowship && degreeEligible) {
    rawScore = Math.min(100, rawScore + 5);
  }

  const eligible = Boolean(degreeEligible && expEligible && ageEligible);
  if (!eligible) {
    rawScore = Math.min(rawScore, 64);
  }

  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  let matchTier = 'EXPLORE';
  if (eligible && score >= 85) {
    matchTier = 'TOP_MATCH';
  } else if (eligible && score >= 72) {
    matchTier = 'STRONG_MATCH';
  } else if (eligible && score >= 55) {
    matchTier = 'ELIGIBLE';
  }

  return {
    score,
    matchTier,
    reasons: reasons.slice(0, 5),
    eligible,
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
    limit = 50,
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
      matchBreakdown: evaluation.breakdown,
    });
  }

  scored.sort((a, b) => {
    if (b.eligible !== a.eligible) return b.eligible ? 1 : -1;
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
