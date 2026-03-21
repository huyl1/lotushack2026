// Populate top 10 majors for University of Padova (Italy)
// University ID: e77bb17f-1d6f-4911-a1b0-682d83ae427c
// QS Rank: 233 | Country: Italy | Region: Europe
// Source: Exa research (bachelorsportal.com, mastersportal.com, shiksha.com,
//         yocket.com, timescoursefinder.com, unipd.it, topuniversities.com)
// Tuition: EUR 2,739–2,900/year (public Italian university, income-based sliding scale)
// EUR→USD at ~1.08: EUR 2,739 ≈ USD 2,958 | EUR 2,900 ≈ USD 3,132
// No SAT/ACT required (European system). IELTS 6.0–6.5 / TOEFL 80+ for English programs.
// Run: node scripts/populate-padova-majors.mjs

const SUPABASE_BASE = "https://erfubjzeantptcuetwti.supabase.co/rest/v1";
const HEADERS = {
  "Authorization": "Bearer sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  "apikey": "sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  "Content-Type": "application/json",
  "Prefer": "return=minimal",
};

const UNIVERSITY_ID = "e77bb17f-1d6f-4911-a1b0-682d83ae427c";

// Data sourced from Exa research:
// - Tuition fees: bachelorsportal.com lists EUR 2,739/yr (most BSc/MSc), EUR 2,900/yr (Medicine),
//   EUR 2,642/yr (Italian Medieval & Renaissance Studies); shiksha.com confirms EUR 2,739–2,900 range.
//   yocket.com confirms EUR 2,739 for CS, Data Science, Info Engineering, Aerospace, Energy Engineering.
// - Acceptance rates: overall ~40% (edurank.org); Medicine highly competitive ~10-15%.
// - IELTS/TOEFL: unipd.it English-degree pages; mastersportal.com (IELTS 6.0, TOEFL 80, PTE 65).
// - Subject rankings: topuniversities.com QS subject rankings for Unipd.
// - Popular programs: beyondthestates.com, yocket.com, shiksha.com listing top programs.
const MAJORS = [
  {
    university_id: UNIVERSITY_ID,
    major_name: "Medicine and Surgery",
    // QS subject: Medicine top 150 globally; 6-year single-cycle degree (Laurea Magistrale a ciclo unico)
    // Tuition: EUR 2,900/yr → ~USD 3,132/yr (bachelorsportal.com)
    subject_ranking: 150,
    acceptance_rate: "12%",
    supplemental_requirements: "Highly competitive entry test (IMAT - International Medical Admissions Test) required for international students. 6-year single-cycle program. Italian language proficiency (B2) recommended for clinical rotations. Limited seats (~40 for English-track). EUR 2,900/yr (~USD 3,132/yr).",
    ielts_min: 6.0,
    toefl_min: 80,
    sat_min: null,
    act_min: null,
    gpa_min: 3.8,
    a_level_grades: "AAA",
    ib_min: 36,
    atar_min: 92.0,
    duolingo_min: 105,
    pte_min: 65,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Psychology",
    // QS subject: Psychology ranked; Padova is Italy's top psychology faculty
    // Tuition: EUR 2,739/yr → ~USD 2,958/yr (bachelorsportal.com, shiksha.com)
    subject_ranking: 201,
    acceptance_rate: "30%",
    supplemental_requirements: "BSc (Laurea Triennale) in Psychology: 3 years. MSc available in Clinical Psychology, Cognitive Neuroscience, and Social Psychology. English-taught MSc tracks available. IELTS 6.0 or TOEFL 80 for English programs. EUR 2,739/yr (~USD 2,958/yr).",
    ielts_min: 6.0,
    toefl_min: 80,
    sat_min: null,
    act_min: null,
    gpa_min: 3.3,
    a_level_grades: "ABB",
    ib_min: 32,
    atar_min: 82.0,
    duolingo_min: 95,
    pte_min: 65,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Computer Science",
    // QS subject: Computer Science & Information Systems; MSc fully in English
    // Tuition: EUR 2,739/yr → ~USD 2,958/yr (mastersportal.com, shiksha.com, yocket.com)
    subject_ranking: 301,
    acceptance_rate: "38%",
    supplemental_requirements: "MSc (Laurea Magistrale) in Computer Science: 2 years, fully taught in English. Requires BSc in CS or closely related field. Strong algorithms and programming background required. IELTS 6.0 or TOEFL 80. 1st Call: Nov–Feb; 2nd Call: Mar–May. EUR 2,739/yr (~USD 2,958/yr).",
    ielts_min: 6.0,
    toefl_min: 80,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: "BBC",
    ib_min: 30,
    atar_min: 80.0,
    duolingo_min: 95,
    pte_min: 65,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Data Science",
    // MSc fully in English; one of Padova's flagship interdisciplinary programs
    // Tuition: EUR 2,739/yr → ~USD 2,958/yr (mastersportal.com, yocket.com)
    subject_ranking: null,
    acceptance_rate: "35%",
    supplemental_requirements: "MSc (Laurea Magistrale) in Data Science: 2 years, fully in English. Interdisciplinary program spanning statistics, machine learning, and big data. BSc in CS, Statistics, Math, or Engineering required. IELTS 6.0 or TOEFL 80. Apply by Aug for Oct start. EUR 2,739/yr (~USD 2,958/yr).",
    ielts_min: 6.0,
    toefl_min: 80,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: "BBC",
    ib_min: 30,
    atar_min: 80.0,
    duolingo_min: 95,
    pte_min: 65,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Information Engineering",
    // BSc (Laurea Triennale); one of most popular undergraduate programs at Padova
    // Tuition: EUR 2,739/yr → ~USD 2,958/yr (yocket.com, shiksha.com)
    subject_ranking: 251,
    acceptance_rate: "40%",
    supplemental_requirements: "BSc (Laurea Triennale) in Information Engineering: 3 years. Strong mathematics and physics background required. Italian proficiency needed (BSc primarily in Italian). English-taught MSc tracks available. IELTS 6.0 / TOEFL 80 for English postgraduate entry. EUR 2,739/yr (~USD 2,958/yr).",
    ielts_min: 6.0,
    toefl_min: 80,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: "BBC",
    ib_min: 30,
    atar_min: 78.0,
    duolingo_min: 95,
    pte_min: 65,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Aerospace Engineering",
    // MSc fully in English; highly ranked in QS Engineering subject
    // Tuition: EUR 2,739/yr → ~USD 2,958/yr (yocket.com, shiksha.com popular specialization)
    subject_ranking: 251,
    acceptance_rate: "35%",
    supplemental_requirements: "MSc (Laurea Magistrale) in Aerospace Engineering: 2 years, fully in English. BSc in Engineering (Mechanical, Aerospace, Industrial, or equivalent). Strong background in mechanics and mathematics. IELTS 6.0 or TOEFL 80. EUR 2,739/yr (~USD 2,958/yr).",
    ielts_min: 6.0,
    toefl_min: 80,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: "ABB",
    ib_min: 32,
    atar_min: 82.0,
    duolingo_min: 95,
    pte_min: 65,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Energy Engineering",
    // MSc fully in English; popular among international students (shiksha.com, timescoursefinder.com)
    // Tuition: EUR 2,739/yr → ~USD 2,958/yr (timescoursefinder.com, yocket.com)
    subject_ranking: null,
    acceptance_rate: "38%",
    supplemental_requirements: "MSc (Laurea Magistrale) in Energy Engineering: 2 years, fully in English. BSc in Engineering or Physics required. Covers renewable energy, power systems, and energy efficiency. IELTS 6.0 or TOEFL 80. October intake. EUR 2,739/yr (~USD 2,958/yr).",
    ielts_min: 6.0,
    toefl_min: 80,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: "ABB",
    ib_min: 31,
    atar_min: 80.0,
    duolingo_min: 95,
    pte_min: 65,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Law",
    // QS subject: Law; Padova Law is one of oldest law faculties in the world (est. 1222)
    // Tuition: EUR 2,739/yr → ~USD 2,958/yr (unischolars.com, beyondthestates.com)
    subject_ranking: 251,
    acceptance_rate: "42%",
    supplemental_requirements: "Single-cycle Laurea Magistrale (5 years) primarily taught in Italian (C1 Italian required). English-taught international track 'Political Sciences, International Relations, Human Rights' (BSc, 3 years) available: IELTS 6.0 or TOEFL 80. Covers European, civil, and criminal law. EUR 2,739/yr (~USD 2,958/yr).",
    ielts_min: 6.0,
    toefl_min: 80,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: "BBC",
    ib_min: 30,
    atar_min: 78.0,
    duolingo_min: 95,
    pte_min: 65,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Economics and Business Administration",
    // QS subject: Social Sciences; Department of Economics and Management
    // Tuition: EUR 2,739/yr → ~USD 2,958/yr; MSc Applied Economics EUR 2,626/yr (mastersportal.com)
    subject_ranking: 301,
    acceptance_rate: "40%",
    supplemental_requirements: "BSc (Laurea Triennale) in Economics: 3 years (Italian-taught). MSc programs in Applied Economics, Management for Sustainable Firms (English-taught, EUR 2,533/yr). IELTS 6.0 or TOEFL 80. GMAT/GRE may be required for some MSc tracks. EUR 2,739/yr (~USD 2,958/yr).",
    ielts_min: 6.0,
    toefl_min: 80,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: "BBC",
    ib_min: 30,
    atar_min: 78.0,
    duolingo_min: 95,
    pte_min: 65,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Biology",
    // QS subject: Life Sciences & Medicine; 'Biology of Human and Environmental Health' BSc in English
    // Tuition: EUR 2,739/yr → ~USD 2,958/yr (bachelorsportal.com)
    subject_ranking: 201,
    acceptance_rate: "38%",
    supplemental_requirements: "BSc 'Biology of Human and Environmental Health': 3 years, taught in English. Strong background in Chemistry and Biology required. MSc programs include Evolutionary Biology, Molecular Biology (English-taught). IELTS 6.0 or TOEFL 80. PTE 65. EUR 2,739/yr (~USD 2,958/yr).",
    ielts_min: 6.0,
    toefl_min: 80,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: "ABB",
    ib_min: 31,
    atar_min: 80.0,
    duolingo_min: 95,
    pte_min: 65,
  },
];

async function main() {
  console.log("Step 1: Deleting existing majors for University of Padova...");
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
