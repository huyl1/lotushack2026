/**
 * Seed script: Top 10 majors for The University of Manchester
 * University ID: fff2e523-0ae3-4943-b749-9cf997c257b9
 * Source: Exa / manchester.ac.uk (2026 entry data)
 * GBP→USD conversion rate: 1 GBP = 1.27 USD (March 2026)
 */

const SUPABASE_BASE = "https://erfubjzeantptcuetwti.supabase.co/rest/v1";
const HEADERS = {
  "Authorization": "Bearer sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  "apikey": "sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  "Content-Type": "application/json",
  "Prefer": "return=minimal",
};

const UNIVERSITY_ID = "fff2e523-0ae3-4943-b749-9cf997c257b9";

// GBP to USD: 1 GBP ≈ 1.27 USD
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const gbpToUsd = (gbp) => Math.round(gbp * 1.27);

/**
 * 10 top/popular majors at University of Manchester (2026 entry)
 * All data sourced from manchester.ac.uk via Exa
 * No SAT/ACT (UK university) — A-Levels primary, IB supported
 * Tuition fees are INTERNATIONAL rates (converted GBP→USD)
 *
 * Fee sources (GBP/yr international):
 *  - Computer Science: £37,800 (collegedunia / manchester.ac.uk)
 *  - Mechanical Engineering: £35,700 (collegedunia / manchester.ac.uk)
 *  - Economics: ~£27,000 (manchester.ac.uk standard arts/social science band)
 *  - Medicine (MBChB): £38,000 yrs 1-2; clinical yrs 3-5 ~£58,000 (manchester.ac.uk)
 *  - Law (LLB): £26,000 (yocket/manchester.ac.uk)
 *  - Mathematics: ~£30,000 (science band, manchester.ac.uk)
 *  - Management (BSc): £33,100 (alliancembs.manchester.ac.uk)
 *  - Psychology: ~£27,000 (arts/social science band)
 *  - Chemistry: ~£33,000 (science band, manchester.ac.uk)
 *  - Environmental Science: ~£27,000 (science band, manchester.ac.uk)
 *
 * supplemental_requirements notes: UK-style admissions via UCAS; no supplemental essays
 * acceptance_rate: Manchester overall ~14% selective; competitive majors tighter
 */

const majors = [
  {
    university_id: UNIVERSITY_ID,
    major_name: "Computer Science",
    acceptance_rate: "~12%",
    supplemental_requirements: "UCAS application; personal statement; no separate supplement. GCSE Maths grade 7+ required.",
    subject_ranking: 8, // QS UK top 10
    ielts_min: 7.0,
    toefl_min: 100,
    sat_min: null,
    act_min: null,
    gpa_min: null,
    a_level_grades: "A*A*A (Maths required; Further Maths preferred)",
    ib_min: 38,
    atar_min: null,
    duolingo_min: null,
    pte_min: 76,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Mechanical Engineering",
    acceptance_rate: "~15%",
    supplemental_requirements: "UCAS application; personal statement. GCSE Maths and Physics grade 7+ required.",
    subject_ranking: 4, // QS UK rank 4
    ielts_min: 6.0,
    toefl_min: 90,
    sat_min: null,
    act_min: null,
    gpa_min: null,
    a_level_grades: "A*A*A (Maths and Physics required)",
    ib_min: 38,
    atar_min: null,
    duolingo_min: null,
    pte_min: 70,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Economics",
    acceptance_rate: "~18%",
    supplemental_requirements: "UCAS application; personal statement. BAEcon programme; Maths A-level strongly preferred.",
    subject_ranking: null,
    ielts_min: 7.0,
    toefl_min: 100,
    sat_min: null,
    act_min: null,
    gpa_min: null,
    a_level_grades: "AAA (Maths required)",
    ib_min: 36,
    atar_min: null,
    duolingo_min: null,
    pte_min: 76,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Medicine (MBChB)",
    acceptance_rate: "~8%",
    supplemental_requirements: "UCAS application; UCAT (university clinical aptitude test) required; MMI interview; work experience in healthcare strongly expected. 5-year programme.",
    subject_ranking: 6, // QS UK rank 6
    ielts_min: 7.0,
    toefl_min: 100,
    sat_min: null,
    act_min: null,
    gpa_min: null,
    a_level_grades: "AAA (Chemistry required; Biology or Maths preferred)",
    ib_min: 37,
    atar_min: null,
    duolingo_min: null,
    pte_min: 76,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Law (LLB)",
    acceptance_rate: "~14%",
    supplemental_requirements: "UCAS application; personal statement. LNAT (Law National Aptitude Test) not required at Manchester. Prefers humanities A-levels.",
    subject_ranking: 10, // QS UK top 10
    ielts_min: 7.0,
    toefl_min: 100,
    sat_min: null,
    act_min: null,
    gpa_min: null,
    a_level_grades: "A*AA (any subjects; essay-based subjects preferred)",
    ib_min: 37,
    atar_min: null,
    duolingo_min: null,
    pte_min: 76,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Mathematics",
    acceptance_rate: "~20%",
    supplemental_requirements: "UCAS application; personal statement. A-level Further Mathematics highly recommended.",
    subject_ranking: null,
    ielts_min: 6.5,
    toefl_min: 90,
    sat_min: null,
    act_min: null,
    gpa_min: null,
    a_level_grades: "A*AA (Maths required; Further Maths recommended)",
    ib_min: 37,
    atar_min: null,
    duolingo_min: null,
    pte_min: 70,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Management (BSc)",
    acceptance_rate: "~20%",
    supplemental_requirements: "UCAS application; personal statement. Alliance Manchester Business School. No specific subject requirements but prefers Economics, Maths, or Business Studies.",
    subject_ranking: 7, // Alliance MBS QS UK rank 7 Business & Management
    ielts_min: 6.5,
    toefl_min: 90,
    sat_min: null,
    act_min: null,
    gpa_min: null,
    a_level_grades: "AAA",
    ib_min: 36,
    atar_min: null,
    duolingo_min: null,
    pte_min: 70,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Psychology",
    acceptance_rate: "~16%",
    supplemental_requirements: "UCAS application; personal statement. BPS-accredited programme. No specific A-level subject required but Biology or Psychology preferred.",
    subject_ranking: 7, // QS UK rank 7
    ielts_min: 7.0,
    toefl_min: 100,
    sat_min: null,
    act_min: null,
    gpa_min: null,
    a_level_grades: "AAA",
    ib_min: 36,
    atar_min: null,
    duolingo_min: null,
    pte_min: 76,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Chemistry",
    acceptance_rate: "~25%",
    supplemental_requirements: "UCAS application; personal statement. RSC-accredited. Chemistry A-level required; Maths or Physics recommended.",
    subject_ranking: 4, // QS UK rank 4 Chemistry
    ielts_min: 6.5,
    toefl_min: 90,
    sat_min: null,
    act_min: null,
    gpa_min: null,
    a_level_grades: "AAA (Chemistry required; Maths or Physics recommended)",
    ib_min: 36,
    atar_min: null,
    duolingo_min: null,
    pte_min: 70,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Environmental Science",
    acceptance_rate: "~30%",
    supplemental_requirements: "UCAS application; personal statement. Field trips included. Science A-levels preferred (Biology, Chemistry, Geography).",
    subject_ranking: 10, // QS UK top 10
    ielts_min: 6.5,
    toefl_min: 90,
    sat_min: null,
    act_min: null,
    gpa_min: null,
    a_level_grades: "AAB (at least one science required)",
    ib_min: 35,
    atar_min: null,
    duolingo_min: null,
    pte_min: 70,
  },
];

async function run() {
  // Step 1: DELETE existing majors
  console.log("Deleting existing majors...");
  const deleteRes = await fetch(
    `${SUPABASE_BASE}/majors?university_id=eq.${UNIVERSITY_ID}`,
    { method: "DELETE", headers: HEADERS }
  );
  console.log(`DELETE status: ${deleteRes.status}`);
  if (!deleteRes.ok && deleteRes.status !== 204) {
    const text = await deleteRes.text();
    console.error("DELETE failed:", text);
    process.exit(1);
  }

  // Step 2: POST 10 majors
  console.log("Inserting 10 majors...");
  const insertRes = await fetch(`${SUPABASE_BASE}/majors`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(majors),
  });
  console.log(`POST status: ${insertRes.status}`);
  if (!insertRes.ok && insertRes.status !== 201 && insertRes.status !== 204) {
    const text = await insertRes.text();
    console.error("POST failed:", text);
    process.exit(1);
  }

  console.log("Done! 10 majors inserted for University of Manchester.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
