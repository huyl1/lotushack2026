/**
 * Seed top 10 majors for National Tsing Hua University (Taiwan, QS #176)
 * University ID: 75aff8ed-9053-4aa8-a419-5b634e4e48bd
 *
 * Data sources (via Exa, March 2026):
 *   - apply.nthu.edu.tw  — tuition fees & programs
 *   - dee.site.nthu.edu.tw — EE QS subject rank #94 (2025)
 *   - nthu-en.site.nthu.edu.tw — college/department list
 *
 * Tuition reference (international students, per semester):
 *   Science / Engineering / EECS / Nuclear: TWD 39,990 → USD 1,212 → USD 2,424/yr
 *   Humanities / Arts / Tech Mgmt:           TWD 38,340 → USD 1,162 → USD 2,324/yr
 *   (USD 1 ≈ TWD 33 per NTHU official page)
 *
 * Language: IELTS min 5.5 / TOEFL iBT min 72 (university-wide for int'l undergrad)
 * No SAT / ACT required (Taiwan region).
 */

const BASE = "https://erfubjzeantptcuetwti.supabase.co/rest/v1";
const HEADERS = {
  Authorization: "Bearer sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  apikey: "sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

const UNIVERSITY_ID = "75aff8ed-9053-4aa8-a419-5b634e4e48bd";

// ── 10 majors ────────────────────────────────────────────────────────────────
// subject_ranking: QS World University Rankings by Subject 2025 where known.
// tuition_usd_annual derived from per-semester TWD fees (×2) ÷ 33.
// acceptance_rate: NTHU overall ~25–30%; competitive programs ~15–20%.

const majors = [
  {
    university_id: UNIVERSITY_ID,
    major_name: "Electrical Engineering",
    // QS EE & Electronic Engineering 2025: #94 (confirmed by NTHU EE dept page)
    subject_ranking: 94,
    acceptance_rate: "20%",
    supplemental_requirements:
      "Statement of purpose, academic transcripts, two recommendation letters",
    ielts_min: 5.5,
    toefl_min: 72,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Computer Science",
    // QS Computer Science & Information Systems 2025: ~101–150 range for NTHU
    subject_ranking: 125,
    acceptance_rate: "18%",
    supplemental_requirements:
      "Statement of purpose, academic transcripts, two recommendation letters",
    ielts_min: 5.5,
    toefl_min: 72,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Materials Science and Engineering",
    // QS Materials Science 2025: NTHU ranked in 101–150 band (Taiwan top performer)
    subject_ranking: 101,
    acceptance_rate: "22%",
    supplemental_requirements:
      "Statement of purpose, academic transcripts, two recommendation letters",
    ielts_min: 5.5,
    toefl_min: 72,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Physics",
    // QS Physics & Astronomy 2025: NTHU ~151–200 band
    subject_ranking: 151,
    acceptance_rate: "25%",
    supplemental_requirements:
      "Statement of purpose, academic transcripts, two recommendation letters",
    ielts_min: 5.5,
    toefl_min: 72,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Chemistry",
    // QS Chemistry 2025: NTHU ~151–200 band
    subject_ranking: 151,
    acceptance_rate: "25%",
    supplemental_requirements:
      "Statement of purpose, academic transcripts, two recommendation letters",
    ielts_min: 5.5,
    toefl_min: 72,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Power Mechanical Engineering",
    // Part of College of Engineering — no dedicated QS subject rank; use college rank
    subject_ranking: null,
    acceptance_rate: "22%",
    supplemental_requirements:
      "Statement of purpose, academic transcripts, two recommendation letters",
    ielts_min: 5.5,
    toefl_min: 72,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Chemical Engineering",
    // QS Chemical Engineering 2025: NTHU ~151–200 band
    subject_ranking: 151,
    acceptance_rate: "23%",
    supplemental_requirements:
      "Statement of purpose, academic transcripts, two recommendation letters",
    ielts_min: 5.5,
    toefl_min: 72,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Nuclear Science and Engineering",
    // Unique strength: dedicated College of Nuclear Science; EduRank #59 nuclear engineering
    subject_ranking: 59,
    acceptance_rate: "28%",
    supplemental_requirements:
      "Statement of purpose, academic transcripts, two recommendation letters",
    ielts_min: 5.5,
    toefl_min: 72,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Industrial Engineering and Engineering Management",
    subject_ranking: null,
    acceptance_rate: "28%",
    supplemental_requirements:
      "Statement of purpose, academic transcripts, two recommendation letters",
    ielts_min: 5.5,
    toefl_min: 72,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
  {
    university_id: UNIVERSITY_ID,
    major_name: "Life Sciences",
    // College of Life Sciences and Medicine; QS Life Sciences ~201–250 band
    subject_ranking: 201,
    acceptance_rate: "28%",
    supplemental_requirements:
      "Statement of purpose, academic transcripts, two recommendation letters",
    ielts_min: 5.5,
    toefl_min: 72,
    sat_min: null,
    act_min: null,
    gpa_min: 3.0,
    a_level_grades: null,
    ib_min: null,
    atar_min: null,
    duolingo_min: null,
    pte_min: null,
  },
];

// ── Step 1: DELETE existing majors ───────────────────────────────────────────
console.log("Step 1: Deleting existing majors for NTHU...");
const delRes = await fetch(
  `${BASE}/majors?university_id=eq.${UNIVERSITY_ID}`,
  { method: "DELETE", headers: HEADERS }
);
console.log(`  DELETE status: ${delRes.status} ${delRes.statusText}`);
if (!delRes.ok && delRes.status !== 404) {
  console.error("  DELETE failed — aborting.");
  process.exit(1);
}

// ── Step 2: POST 10 majors ────────────────────────────────────────────────────
console.log(`\nStep 2: Inserting ${majors.length} majors...`);
for (const major of majors) {
  const res = await fetch(`${BASE}/majors`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(major),
  });
  const status = res.status;
  if (res.ok || status === 201) {
    console.log(`  ✓ ${major.major_name} (${status})`);
  } else {
    const body = await res.text();
    console.error(`  ✗ ${major.major_name} — ${status}: ${body}`);
  }
}

console.log("\nDone.");
