/**
 * Seed top 10 majors for University of Minnesota (System)
 * University ID: d749fc0e-7d12-41d9-ae41-91475642df1f
 *
 * Data sourced from:
 * - mycollegeselection.com (enrollment counts by major, 2025)
 * - admissions.tc.umn.edu (Fall 2025 admitted freshman academic profile by college)
 * - usnews.com (most popular majors)
 * - nextadmit.com / prepscholar.com (SAT/ACT ranges)
 *
 * Run: node scripts/seed-umn-majors.mjs
 */

const BASE = "https://erfubjzeantptcuetwti.supabase.co/rest/v1";
const HEADERS = {
  "Authorization": "Bearer sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  "apikey": "sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  "Content-Type": "application/json",
  "Prefer": "return=minimal",
};

const UNIVERSITY_ID = "d749fc0e-7d12-41d9-ae41-91475642df1f";

// Top 10 majors by undergraduate enrollment (mycollegeselection.com, 2025)
// SAT/ACT mins = 25th percentile for the relevant college (admissions.tc.umn.edu Fall 2025 profile)
// GPA mins = typical floor for each college
// Acceptance rates derived from overall 79.75% with college-level adjustments
// (CSE ~55-60%, Carlson ~65%, CBS ~70%, CLA ~80%, Nursing ~60%)
const majors = [
  {
    university_id: UNIVERSITY_ID,
    major_name: "Computer Science",
    // CSE college — most selective; 1,313 students in Fall 2023 (cse.umn.edu)
    // Fall 2025 admitted CSE: SAT 1390–1530, ACT 30–34, GPA 3.70–3.95
    acceptance_rate: "55%",
    subject_ranking: 23, // QS CS ranking ~top 100 globally; niche.com #23 for IT in America
    sat_min: 1390,
    act_min: 30,
    gpa_min: 3.7,
    ielts_min: 6.5,
    toefl_min: 79,
    supplemental_requirements: "Strong math background required; internal major admission requires 3.2+ technical GPA after prerequisite courses",
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Psychology",
    // CLA college — 495 enrolled (mycollegeselection.com)
    // Fall 2025 admitted CLA: SAT 1310–1450, ACT 27–31, GPA 3.50–3.90
    acceptance_rate: "80%",
    subject_ranking: 52, // niche.com #52 Best Colleges for Psychology in America
    sat_min: 1310,
    act_min: 27,
    gpa_min: 3.5,
    ielts_min: 6.5,
    toefl_min: 79,
    supplemental_requirements: null,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Biology / Biological Sciences",
    // CBS college — 336 enrolled (mycollegeselection.com)
    // Fall 2025 admitted CBS: SAT 1340–1470, ACT 28–32, GPA 3.60–3.95
    acceptance_rate: "70%",
    subject_ranking: null,
    sat_min: 1340,
    act_min: 28,
    gpa_min: 3.6,
    ielts_min: 6.5,
    toefl_min: 79,
    supplemental_requirements: null,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Finance",
    // Carlson School of Management — 273 enrolled (mycollegeselection.com)
    // Fall 2025 admitted Carlson: SAT 1360–1490, ACT 28–32, GPA 3.60–3.95
    acceptance_rate: "65%",
    subject_ranking: null,
    sat_min: 1360,
    act_min: 28,
    gpa_min: 3.6,
    ielts_min: 6.5,
    toefl_min: 79,
    supplemental_requirements: "Direct-admit to Carlson; competitive internal admission after freshman year for non-direct admits",
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Mechanical Engineering",
    // CSE college — 202 enrolled (mycollegeselection.com)
    // Same college as CS; Fall 2025 admitted CSE: SAT 1380–1520, ACT 29–33
    acceptance_rate: "58%",
    subject_ranking: null,
    sat_min: 1380,
    act_min: 29,
    gpa_min: 3.7,
    ielts_min: 6.5,
    toefl_min: 79,
    supplemental_requirements: "Internal major admission requires 3.2+ technical GPA after prerequisite courses",
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Marketing",
    // Carlson School of Management — 183 enrolled (mycollegeselection.com)
    acceptance_rate: "65%",
    subject_ranking: null,
    sat_min: 1360,
    act_min: 28,
    gpa_min: 3.6,
    ielts_min: 6.5,
    toefl_min: 79,
    supplemental_requirements: "Direct-admit to Carlson; competitive internal admission after freshman year for non-direct admits",
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Mathematics",
    // CSE college — 179 enrolled (mycollegeselection.com)
    // Fall 2025 admitted CSE: SAT 1380–1520, ACT 29–33
    acceptance_rate: "60%",
    subject_ranking: null,
    sat_min: 1380,
    act_min: 29,
    gpa_min: 3.6,
    ielts_min: 6.5,
    toefl_min: 79,
    supplemental_requirements: null,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Political Science",
    // CLA college — 169 enrolled (mycollegeselection.com)
    // Fall 2025 admitted CLA: SAT 1310–1450, ACT 27–31, GPA 3.50–3.90
    acceptance_rate: "80%",
    subject_ranking: null,
    sat_min: 1310,
    act_min: 27,
    gpa_min: 3.5,
    ielts_min: 6.5,
    toefl_min: 79,
    supplemental_requirements: null,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Economics",
    // CLA college — ~160 enrolled (mycollegeselection.com, listed after Political Science)
    acceptance_rate: "80%",
    subject_ranking: null,
    sat_min: 1310,
    act_min: 27,
    gpa_min: 3.5,
    ielts_min: 6.5,
    toefl_min: 79,
    supplemental_requirements: null,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Nursing (B.S.N.)",
    // School of Nursing — 134 enrolled (mycollegeselection.com)
    // Fall 2025 admitted Nursing: SAT 1340–1470, ACT 28–32, GPA 3.70–3.95
    acceptance_rate: "60%",
    subject_ranking: null,
    sat_min: 1340,
    act_min: 28,
    gpa_min: 3.7,
    ielts_min: 6.5,
    toefl_min: 79,
    supplemental_requirements: "Highly competitive; requires completion of pre-nursing prerequisites with strong GPA",
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
];

async function main() {
  // Step 1: DELETE existing majors
  console.log("Deleting existing majors for UMN...");
  const deleteRes = await fetch(
    `${BASE}/majors?university_id=eq.${UNIVERSITY_ID}`,
    { method: "DELETE", headers: HEADERS }
  );
  if (!deleteRes.ok) {
    const text = await deleteRes.text();
    throw new Error(`DELETE failed: ${deleteRes.status} ${text}`);
  }
  console.log(`DELETE ${deleteRes.status} — existing majors removed.`);

  // Step 2: POST 10 majors
  console.log("Inserting 10 majors...");
  const postRes = await fetch(`${BASE}/majors`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(majors),
  });
  if (!postRes.ok) {
    const text = await postRes.text();
    throw new Error(`POST failed: ${postRes.status} ${text}`);
  }
  console.log(`POST ${postRes.status} — 10 majors inserted successfully.`);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
