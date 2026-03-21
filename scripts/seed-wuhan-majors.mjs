// Seed top 10 majors for Wuhan University
// University ID: cafbbd38-f40a-4995-8b79-18b98f5cdfb5
// Data sourced from Exa: e-square.com.my, cucas.cn, china-admissions.com, shiksha.com
// CNY→USD conversion at ~0.138 (March 2026)

const SUPABASE_BASE = "https://erfubjzeantptcuetwti.supabase.co/rest/v1";
const HEADERS = {
  Authorization: "Bearer sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  apikey: "sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

const UNIVERSITY_ID = "cafbbd38-f40a-4995-8b79-18b98f5cdfb5";

// Top 10 majors from Exa data (e-square.com.my program list + cucas.cn + admissions guide)
// WHU strengths: Remote Sensing (#1 globally), Law (top China), Medicine,
//   CS/AI, Journalism, Finance, International Economics, Engineering
// Tuition CNY→USD at 0.138; No SAT/ACT for China; IELTS/TOEFL for English-taught only
const majors = [
  {
    university_id: UNIVERSITY_ID,
    major_name: "Computer Science and Technology",
    // RMB 26,000/yr → $3,588; Chinese-taught → HSK4 required, no IELTS/TOEFL
    subject_ranking: 1,
    acceptance_rate: null,
    supplemental_requirements: "HSK4 (180+) required for Chinese-taught program; portfolio/interview may be required",
    ielts_min: null,
    toefl_min: null,
    sat_min: null,
    act_min: null,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Clinical Medicine (MBBS)",
    // RMB 40,000/yr → $5,520; English-taught
    subject_ranking: 2,
    acceptance_rate: null,
    supplemental_requirements: "English-taught; 6-year program; minimum 70% in high school Biology and Chemistry; IELTS or TOEFL required",
    ielts_min: 6.0,
    toefl_min: 80,
    sat_min: null,
    act_min: null,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Remote Sensing Science and Technology",
    // RMB 26,000/yr → $3,588; Chinese-taught; WHU ranked #1 globally in this field
    subject_ranking: 3,
    acceptance_rate: null,
    supplemental_requirements: "HSK4 (180+) required; WHU is globally ranked #1 in Remote Sensing Science",
    ielts_min: null,
    toefl_min: null,
    sat_min: null,
    act_min: null,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Law",
    // RMB 20,000/yr → $2,760; Chinese-taught; top-ranked in China
    subject_ranking: 4,
    acceptance_rate: null,
    supplemental_requirements: "HSK4 (180+) required; top-ranked Law program in China",
    ielts_min: null,
    toefl_min: null,
    sat_min: null,
    act_min: null,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "International Economics and Trade",
    // RMB 23,000/yr (English-taught) → $3,174
    subject_ranking: 5,
    acceptance_rate: null,
    supplemental_requirements: "Available in both Chinese-taught (HSK4) and English-taught tracks; English track requires IELTS 6.0 or TOEFL 80",
    ielts_min: 6.0,
    toefl_min: 80,
    sat_min: null,
    act_min: null,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Finance",
    // RMB 23,000/yr (English-taught) → $3,174
    subject_ranking: 6,
    acceptance_rate: null,
    supplemental_requirements: "Available in both Chinese-taught (HSK4) and English-taught tracks; English track requires IELTS 6.0 or TOEFL 80",
    ielts_min: 6.0,
    toefl_min: 80,
    sat_min: null,
    act_min: null,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Journalism and Communication",
    // RMB 20,000/yr → $2,760; Chinese-taught; top 3 in China
    subject_ranking: 7,
    acceptance_rate: null,
    supplemental_requirements: "HSK4 (180+) required; ranked top 3 in China for Journalism and Communication",
    ielts_min: null,
    toefl_min: null,
    sat_min: null,
    act_min: null,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Business Administration",
    // RMB 23,000/yr (English-taught) → $3,174
    subject_ranking: 8,
    acceptance_rate: null,
    supplemental_requirements: "Available in both Chinese-taught (HSK4) and English-taught tracks; English track requires IELTS 6.0 or TOEFL 80",
    ielts_min: 6.0,
    toefl_min: 80,
    sat_min: null,
    act_min: null,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Software Engineering",
    // RMB 26,000/yr → $3,588; Chinese-taught
    subject_ranking: 9,
    acceptance_rate: null,
    supplemental_requirements: "HSK4 (180+) required; English-medium master's track also available with IELTS 6.0",
    ielts_min: null,
    toefl_min: null,
    sat_min: null,
    act_min: null,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Environmental Science",
    // RMB 23,000/yr → $3,174; Chinese-taught
    subject_ranking: 10,
    acceptance_rate: null,
    supplemental_requirements: "HSK4 (180+) required; strong research focus aligned with China's national sustainability initiatives",
    ielts_min: null,
    toefl_min: null,
    sat_min: null,
    act_min: null,
    gpa_min: 2.5,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
];

async function run() {
  // Step 1: DELETE existing majors
  console.log("Deleting existing majors for Wuhan University...");
  const delRes = await fetch(
    `${SUPABASE_BASE}/majors?university_id=eq.${UNIVERSITY_ID}`,
    { method: "DELETE", headers: HEADERS }
  );
  console.log("DELETE status:", delRes.status, delRes.statusText);

  // Step 2: POST 10 majors
  console.log("Inserting 10 majors...");
  const postRes = await fetch(`${SUPABASE_BASE}/majors`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(majors),
  });
  console.log("POST status:", postRes.status, postRes.statusText);

  if (!postRes.ok) {
    const body = await postRes.text();
    console.error("POST error body:", body);
    process.exit(1);
  }

  console.log("Done! 10 majors inserted for Wuhan University.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
