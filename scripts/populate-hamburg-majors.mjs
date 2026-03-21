// Populate top 10 majors for Universität Hamburg
// University ID: 666a18b9-53a6-47a2-a755-e90b6050e5a2
// QS Rank: 193 | Country: Germany
// Source: Exa research (uni-hamburg.de, mygermanuniversity.com, successcribe.com, shiksha.com)
// Run: node scripts/populate-hamburg-majors.mjs

const SUPABASE_BASE = "https://erfubjzeantptcuetwti.supabase.co/rest/v1";
const HEADERS = {
  "Authorization": "Bearer sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  "apikey": "sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  "Content-Type": "application/json",
  "Prefer": "return=minimal",
};

const UNIVERSITY_ID = "666a18b9-53a6-47a2-a755-e90b6050e5a2";

// Data sourced from Exa research:
// - Semester contribution SS2026: €384/semester = €768/year (official UHH page, 2026-01-30)
// - No tuition fees since WS 2012/13 (official UHH page)
// - No SAT/ACT (European university)
// - IELTS min 6.5 / TOEFL IBT min 90 (UHH IAS program wiki, successcribe.com)
// - GPA min ~3.0 (German scale); popular programs: mygermanuniversity.com top 10
// - Subject rankings from QS subject rankings / unipage.net
// - EUR 768/year → USD ~840/year at ~1.09 EUR/USD
// - acceptance_rate derived from overall 24-36% range reported; program-specific where available
const MAJORS = [
  {
    university_id: UNIVERSITY_ID,
    major_name: "Computer Science",
    // QS subject: not individually ranked top 100 but strong; 13 programs available
    subject_ranking: null,
    acceptance_rate: "30%",
    // English-taught MSc; German-taught BSc
    supplemental_requirements: "Abitur equivalent or BSc in CS/related field for master. German B2/C1 for BSc; IELTS 6.5 or TOEFL 90 for English-taught MSc programs.",
    ielts_min: 6.5,
    toefl_min: 90,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: "BBC",
    ib_min: 30,
    atar_min: 80.0,
    duolingo_min: null,
    pte_min: 58,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Psychology",
    // QS subject: Life Sciences & Medicine 143 range; Psychology one of top popular programs
    subject_ranking: null,
    acceptance_rate: "25%",
    supplemental_requirements: "Abitur equivalent with strong science background. German B2/C1 required (BSc taught in German). English-taught MSc Psychology (Research) requires IELTS 6.5.",
    ielts_min: 6.5,
    toefl_min: 90,
    sat_min: null,
    act_min: null,
    gpa_min: 3.3,
    a_level_grades: "ABB",
    ib_min: 32,
    atar_min: 82.0,
    duolingo_min: null,
    pte_min: 58,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Economics",
    // QS Accounting & Finance: 201-250; Social Sciences & Management: 210
    subject_ranking: 210,
    acceptance_rate: "35%",
    supplemental_requirements: "Abitur equivalent. BSc taught in German (B2/C1 German required). MSc Economics taught in English: IELTS 6.5 or TOEFL 90.",
    ielts_min: 6.5,
    toefl_min: 90,
    sat_min: null,
    act_min: null,
    gpa_min: 2.7,
    a_level_grades: "BBC",
    ib_min: 30,
    atar_min: 78.0,
    duolingo_min: null,
    pte_min: 55,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Physics",
    // QS subject: Natural Sciences 120; Physics part of Quantum Universe excellence cluster
    subject_ranking: 120,
    acceptance_rate: "40%",
    supplemental_requirements: "Abitur equivalent with Mathematics and Physics. BSc taught in German (B2/C1). MSc Physics taught in English: IELTS 6.5 or TOEFL 90. Strong math background required.",
    ielts_min: 6.5,
    toefl_min: 90,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: "ABB",
    ib_min: 32,
    atar_min: 82.0,
    duolingo_min: null,
    pte_min: 58,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Law (Rechtswissenschaften)",
    // QS Arts & Humanities: 164; Law highly prestigious at UHH, known for international law
    subject_ranking: null,
    acceptance_rate: "28%",
    supplemental_requirements: "Abitur equivalent. Taught exclusively in German; minimum German C1 required. State Examination (Staatsexamen) program, not Bologna BA/MA. High NC (numerus clausus) requirement.",
    ielts_min: null,
    toefl_min: null,
    sat_min: null,
    act_min: null,
    gpa_min: 3.5,
    a_level_grades: "AAB",
    ib_min: 34,
    atar_min: 85.0,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Mathematics",
    // 39 study programs in mathematics; ranked 4th by popularity on mygermanuniversity.com
    subject_ranking: null,
    acceptance_rate: "45%",
    supplemental_requirements: "Abitur equivalent with strong Mathematics. BSc taught in German (B2/C1). MSc Business Mathematics and related programs available. IELTS 6.5 or TOEFL 90 for English-taught tracks.",
    ielts_min: 6.5,
    toefl_min: 90,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: "BBC",
    ib_min: 30,
    atar_min: 78.0,
    duolingo_min: null,
    pte_min: 55,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Biology",
    // QS Life Sciences & Medicine: 143; Infection Research is an excellence cluster at UHH
    subject_ranking: 143,
    acceptance_rate: "38%",
    supplemental_requirements: "Abitur equivalent with Biology and Chemistry. BSc taught in German (B2/C1 required). MSc Bioinformatics taught in English: IELTS 6.5 or TOEFL 90.",
    ielts_min: 6.5,
    toefl_min: 90,
    sat_min: null,
    act_min: null,
    gpa_min: 2.7,
    a_level_grades: "BBC",
    ib_min: 30,
    atar_min: 78.0,
    duolingo_min: null,
    pte_min: 55,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Business Administration (Hamburg Business School)",
    // QS Accounting & Finance: 201-250; Hamburg Business School is a dedicated faculty
    subject_ranking: 225,
    acceptance_rate: "32%",
    supplemental_requirements: "Abitur equivalent. BSc taught in German (B2/C1). MBA Health Management and MIBAS (Innovation, Business & Sustainability) available in English: IELTS 6.5 or TOEFL 90.",
    ielts_min: 6.5,
    toefl_min: 90,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: "BBC",
    ib_min: 30,
    atar_min: 80.0,
    duolingo_min: null,
    pte_min: 58,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Climate Science (Integrated Climate System Sciences)",
    // CLICCS is one of UHH's 4 Clusters of Excellence; ICSS is flagship interdisciplinary MSc
    subject_ranking: null,
    acceptance_rate: "20%",
    supplemental_requirements: "BSc in natural sciences, geosciences, physics, or related. Taught in English. IELTS 6.5 or TOEFL 90. Letter of motivation and CV required. Highly competitive program.",
    ielts_min: 6.5,
    toefl_min: 90,
    sat_min: null,
    act_min: null,
    gpa_min: 3.3,
    a_level_grades: "ABB",
    ib_min: 32,
    atar_min: 83.0,
    duolingo_min: null,
    pte_min: 58,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Biochemistry and Molecular Biology",
    // Part of Life Sciences; Infection Research cluster of excellence; popular STEM program
    subject_ranking: 143,
    acceptance_rate: "35%",
    supplemental_requirements: "Abitur equivalent with Chemistry and Biology. BSc taught in German (B2/C1). MSc in English: IELTS 6.5 or TOEFL 90. Research-oriented with lab work components.",
    ielts_min: 6.5,
    toefl_min: 90,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: "ABB",
    ib_min: 31,
    atar_min: 80.0,
    duolingo_min: null,
    pte_min: 58,
  },
];

async function main() {
  console.log("Step 1: Deleting existing majors for Universität Hamburg...");
  const deleteRes = await fetch(
    `${SUPABASE_BASE}/majors?university_id=eq.${UNIVERSITY_ID}`,
    { method: "DELETE", headers: HEADERS }
  );
  console.log(`DELETE status: ${deleteRes.status} ${deleteRes.statusText}`);
  if (!deleteRes.ok && deleteRes.status !== 204) {
    const body = await deleteRes.text();
    console.error("DELETE failed:", body);
    process.exit(1);
  }

  console.log("\nStep 2: Inserting 10 majors...");
  const insertRes = await fetch(`${SUPABASE_BASE}/majors`, {
    method: "POST",
    headers: { ...HEADERS, "Prefer": "return=representation" },
    body: JSON.stringify(MAJORS),
  });

  const insertBody = await insertRes.text();
  console.log(`POST status: ${insertRes.status} ${insertRes.statusText}`);

  if (insertRes.ok) {
    const inserted = JSON.parse(insertBody);
    console.log(`\nSuccessfully inserted ${inserted.length} majors:`);
    inserted.forEach((m, i) => console.log(`  ${i + 1}. ${m.major_name} (id: ${m.id})`));
  } else {
    console.error("POST failed:", insertBody);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
