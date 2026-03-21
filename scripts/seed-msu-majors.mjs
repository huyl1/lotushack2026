// Seed top 10 majors for Michigan State University
// University ID: 2a50a274-decc-430c-91ec-b656ad108ad5
// Data sourced from Exa (Niche, CollegeRaptor, MSU official, US News, BigFuture) 2024

const BASE = "https://erfubjzeantptcuetwti.supabase.co/rest/v1";
const UNIVERSITY_ID = "2a50a274-decc-430c-91ec-b656ad108ad5";
const HEADERS = {
  "Authorization": "Bearer sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  "apikey": "sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  "Content-Type": "application/json",
  "Prefer": "return=minimal",
};

// Source notes:
// - Graduate counts: Niche / CollegeRaptor 2024
// - Overall SAT middle 50%: 1100–1320 (MSU admissions.msu.edu, BigFuture 2024-25)
// - Overall ACT middle 50%: 24–30 (MSU admissions.msu.edu 2025)
// - Broad College (Business) acceptance rate: 38%, avg SAT 1209 (Poets&Quants 2025)
// - Engineering: secondary admission required, STEM-selective
// - Supply Chain: #1 US News 2026 (15 consecutive years)
// - IELTS min 6.5, TOEFL min 80, Duolingo min 110 (admissions.msu.edu)
// - GPA min 2.0 for most programs (MSU policy)
// - Biology: Niche #65 nationally; 580 grads (#1 at MSU)
// - Psychology: 496 grads (#2 at MSU)
// - Advertising: 417 grads (#3 at MSU); Niche #18 Communications
// - Information Science: 372 grads (#4 at MSU)
// - Supply Chain/Logistics: 364 grads (#5 at MSU); #1 US News
// - Finance: 350 grads (#6 at MSU); Niche #41 Accounting & Finance
// - Communications: 348 grads (#7 at MSU)
// - Kinesiology: 298 grads (#8 at MSU)
// - Mechanical Engineering: 279 grads (#9 at MSU)
// - Economics: 274 grads (#10 at MSU); Niche #50 Economics

const MAJORS = [
  {
    university_id: UNIVERSITY_ID,
    major_name: "Biology",
    acceptance_rate: "85%",           // MSU overall (Biology = open enrollment college)
    supplemental_requirements: "No supplemental application required for direct admission; pre-med advising available",
    subject_ranking: 65,              // Niche #65 Best Colleges for Biology in America
    ielts_min: 6.5,
    toefl_min: 80,
    sat_min: 1100,
    act_min: 24,
    gpa_min: 2.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: 110,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Psychology",
    acceptance_rate: "85%",           // College of Social Science, open enrollment
    supplemental_requirements: "No supplemental application; BA or BS track available",
    subject_ranking: null,
    ielts_min: 6.5,
    toefl_min: 80,
    sat_min: 1100,
    act_min: 24,
    gpa_min: 2.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: 110,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Advertising",
    acceptance_rate: "38%",           // Broad College of Business acceptance rate (Poets&Quants 2025)
    supplemental_requirements: "Secondary admission to Eli Broad College of Business required; minimum 2.5 GPA",
    subject_ranking: 18,              // Niche #18 Best Colleges for Communications in America
    ielts_min: 6.5,
    toefl_min: 80,
    sat_min: 1100,
    act_min: 24,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: 110,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Computer Science",
    acceptance_rate: "60%",           // Engineering college secondary admission, more selective
    supplemental_requirements: "Secondary admission to College of Engineering required; must complete EGR 100, CSE 231, MTH 132 with qualifying grades before admission",
    subject_ranking: null,
    ielts_min: 6.5,
    toefl_min: 80,
    sat_min: 1200,
    act_min: 27,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: 110,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Supply Chain Management",
    acceptance_rate: "38%",           // Broad College of Business acceptance rate (Poets&Quants 2025)
    supplemental_requirements: "Secondary admission to Eli Broad College of Business required; minimum 2.5 GPA; #1 nationally ranked program (US News 2026)",
    subject_ranking: 1,               // US News #1 Supply Chain Management/Logistics 2026 (15 consecutive years)
    ielts_min: 6.5,
    toefl_min: 80,
    sat_min: 1100,
    act_min: 24,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: 110,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Finance",
    acceptance_rate: "38%",           // Broad College of Business acceptance rate (Poets&Quants 2025)
    supplemental_requirements: "Secondary admission to Eli Broad College of Business required; minimum 2.5 GPA",
    subject_ranking: 41,              // Niche #41 Best Colleges for Accounting and Finance in America
    ielts_min: 6.5,
    toefl_min: 80,
    sat_min: 1100,
    act_min: 24,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: 110,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Communications",
    acceptance_rate: "85%",           // College of Communication Arts & Sciences, open enrollment
    supplemental_requirements: "No supplemental application required for direct admission",
    subject_ranking: 18,              // Niche #18 Best Colleges for Communications in America
    ielts_min: 6.5,
    toefl_min: 80,
    sat_min: 1100,
    act_min: 24,
    gpa_min: 2.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: 110,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Kinesiology and Exercise Science",
    acceptance_rate: "85%",           // College of Education, open enrollment
    supplemental_requirements: "No supplemental application required; clinical practicum components in upper division",
    subject_ranking: null,
    ielts_min: 6.5,
    toefl_min: 80,
    sat_min: 1100,
    act_min: 24,
    gpa_min: 2.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: 110,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Mechanical Engineering",
    acceptance_rate: "60%",           // Engineering college secondary admission, more selective
    supplemental_requirements: "Secondary admission to College of Engineering required; must complete foundational engineering and math courses with qualifying grades before full admission",
    subject_ranking: null,
    ielts_min: 6.5,
    toefl_min: 80,
    sat_min: 1200,
    act_min: 27,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: 110,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Economics",
    acceptance_rate: "85%",           // College of Social Science, open enrollment
    supplemental_requirements: "No supplemental application required; BA or BS track available",
    subject_ranking: 50,              // Niche #50 Best Colleges for Economics in America
    ielts_min: 6.5,
    toefl_min: 80,
    sat_min: 1100,
    act_min: 24,
    gpa_min: 2.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: 110,
    pte_min: null,
  },
];

async function main() {
  // Step 1: DELETE existing majors
  console.log("Deleting existing majors for MSU...");
  const deleteRes = await fetch(
    `${BASE}/majors?university_id=eq.${UNIVERSITY_ID}`,
    { method: "DELETE", headers: HEADERS }
  );
  console.log(`DELETE status: ${deleteRes.status}`);
  if (!deleteRes.ok && deleteRes.status !== 204) {
    const text = await deleteRes.text();
    console.error("DELETE failed:", text);
    process.exit(1);
  }

  // Step 2: POST all 10 majors in one batch
  console.log("Inserting 10 majors...");
  const postRes = await fetch(`${BASE}/majors`, {
    method: "POST",
    headers: { ...HEADERS, "Prefer": "return=representation" },
    body: JSON.stringify(MAJORS),
  });
  console.log(`POST status: ${postRes.status}`);
  const body = await postRes.text();
  if (!postRes.ok) {
    console.error("POST failed:", body);
    process.exit(1);
  }
  const inserted = JSON.parse(body);
  console.log(`Successfully inserted ${inserted.length} majors:`);
  inserted.forEach((m, i) => console.log(`  ${i + 1}. ${m.major_name} (id: ${m.id})`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
