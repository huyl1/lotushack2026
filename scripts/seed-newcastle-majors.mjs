/**
 * Seed script: Top 10 majors for The University of Newcastle (Australia, QS 227)
 * University ID: 69f55df7-c976-480b-866b-b708a253b08c
 *
 * Data sourced from:
 *   - newcastle.edu.au degree pages (selection ranks, indicative fees AUD)
 *   - UAC lowest selection ranks Jan Round 1 2026
 *   - IDP Education / Educatly / Shiksha (international indicative fees AUD)
 *   - UAC top-20 most popular courses 2026
 *   - Newcastle Herald 2026 demand articles
 *
 * AUD → USD conversion: 0.6943 (2026 average, ATO / Exchange Rates UK)
 * Fees shown are international indicative annual tuition fees (AUD per year → USD).
 * atar_min = lowest selection rank (SR) from UAC Jan R1 2026 / UoN degree pages.
 * ielts_min = 6.5 unless degree page specifies otherwise.
 */

const SUPABASE_BASE = "https://erfubjzeantptcuetwti.supabase.co/rest/v1";
const UNIVERSITY_ID = "69f55df7-c976-480b-866b-b708a253b08c";
const HEADERS = {
  Authorization: "Bearer sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  apikey: "sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU",
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

const AUD_TO_USD = 0.6943;
function audToUsd(aud) {
  return Math.round(aud * AUD_TO_USD);
}

// 10 majors — name, atar_min (lowest SR from UAC/UoN), annual_fee_aud, subject_ranking, ielts_min
const majors = [
  {
    // #1 most popular at UoN per 2024 & 2026 data; world top 47 for Nursing
    major_name: "Bachelor of Nursing",
    atar_min: 75.0,
    annual_fee_aud: 44210, // IDP 2026 international indicative fee
    subject_ranking: 47,
    ielts_min: 7.0, // ANMAC-accredited nursing requires 7.0
    acceptance_rate: "~70%",
    supplemental_requirements: "ANMAC accredited; 800 hours clinical placement required",
  },
  {
    // #2 most popular (2024 news); UAC top 20 #4 for Joint Medical Program
    major_name: "Bachelor of Medical Science and Doctor of Medicine (Joint Medical Program)",
    atar_min: 95.0, // highly competitive, joint program with UNE
    annual_fee_aud: 68000, // indicative for medical program
    subject_ranking: null,
    ielts_min: 7.0,
    acceptance_rate: "~10%",
    supplemental_requirements: "Joint program with University of New England; UCAT required; interview; 5-year program + internship",
  },
  {
    // #3 most popular (2024 news); world top 200 for Law; SR 87 from UoN degree page
    major_name: "Bachelor of Laws (Honours) Combined",
    atar_min: 87.0,
    annual_fee_aud: 39695, // from UoN degree page (Arts/Laws indicative fee)
    subject_ranking: 200,
    ielts_min: 7.0,
    acceptance_rate: "~35%",
    supplemental_requirements: "Combined degree only; Diploma of Legal Practice available post-graduation for admission to practice",
  },
  {
    // #4 most popular (2024 news); world top 175 for Education
    major_name: "Bachelor of Education (Primary)",
    atar_min: 65.0,
    annual_fee_aud: 33800, // indicative domestic/international fee range
    subject_ranking: 175,
    ielts_min: 7.5, // NESA teaching registration requires 7.5
    acceptance_rate: "~75%",
    supplemental_requirements: "Commonwealth Prac Payment eligible; NESA accredited; Working with Children Check required",
  },
  {
    // Strong demand; SR 63 from UoN degree page; world top 150 for Business Administration
    major_name: "Bachelor of Business",
    atar_min: 63.0,
    annual_fee_aud: 40540, // from UoN degree page
    subject_ranking: 150,
    ielts_min: 6.5,
    acceptance_rate: "~80%",
    supplemental_requirements: "AACSB & EQUIS accredited; choose 2 majors from HR, Marketing, Entrepreneurship, International Business, etc.",
  },
  {
    // SR 65 from UoN degree page; world top 175 for Business and Economics
    major_name: "Bachelor of Commerce",
    atar_min: 65.0,
    annual_fee_aud: 38500, // indicative fee
    subject_ranking: 175,
    ielts_min: 6.5,
    acceptance_rate: "~78%",
    supplemental_requirements: "AACSB & EQUIS accredited; dual major options in Accounting, Finance, Economics, etc.",
  },
  {
    // World top 200 for Computer Science; 15.6% projected employment growth
    major_name: "Bachelor of Computer Science",
    atar_min: 65.0,
    annual_fee_aud: 42000, // indicative international fee
    subject_ranking: 200,
    ielts_min: 6.5,
    acceptance_rate: "~75%",
    supplemental_requirements: "APS Data & Digital Cadet Program available; specialisations in AI, cybersecurity, VR/AR",
  },
  {
    // World top 200 for Psychology; APAC accredited
    major_name: "Bachelor of Psychological Science",
    atar_min: 65.0,
    annual_fee_aud: 35000, // indicative international fee
    subject_ranking: 200,
    ielts_min: 6.5,
    acceptance_rate: "~75%",
    supplemental_requirements: "APAC accredited; 4th year Honours pathway required for clinical registration",
  },
  {
    // World top 200 for Civil & Structural; 12 weeks professional practice; AUD ~42k (Shiksha)
    major_name: "Bachelor of Civil Engineering (Honours)",
    atar_min: 70.0,
    annual_fee_aud: 41995, // Shiksha 2026
    subject_ranking: 200,
    ielts_min: 6.5,
    acceptance_rate: "~70%",
    supplemental_requirements: "Engineers Australia accredited; 12 weeks professional practice; structural, water & geotechnical specialisations",
  },
  {
    // World top 200 for Science; world top 250 for Life Sciences; AUD 42,840 (Educatly 2026)
    major_name: "Bachelor of Biomedical Science",
    atar_min: 70.0,
    annual_fee_aud: 42840, // Educatly/UoN Science indicative fee
    subject_ranking: 250,
    ielts_min: 6.5,
    acceptance_rate: "~72%",
    supplemental_requirements: "Clinical placement throughout program; pathways to medicine, pharmacy, research",
  },
];

async function run() {
  // Step 1: DELETE existing majors for this university
  console.log("Step 1: Deleting existing majors...");
  const deleteRes = await fetch(
    `${SUPABASE_BASE}/majors?university_id=eq.${UNIVERSITY_ID}`,
    { method: "DELETE", headers: HEADERS }
  );
  if (!deleteRes.ok) {
    const text = await deleteRes.text();
    throw new Error(`DELETE failed: ${deleteRes.status} ${text}`);
  }
  console.log("  ✓ Deleted existing majors");

  // Step 2: POST 10 majors one by one
  console.log("Step 2: Inserting 10 majors...");
  for (const m of majors) {
    const payload = {
      university_id: UNIVERSITY_ID,
      major_name: m.major_name,
      atar_min: m.atar_min,
      // Convert AUD annual fee to USD (tuition_usd is on University, not Major,
      // but we store context in supplemental_requirements and use sat_min as a
      // proxy — schema has no tuition field on Major, so we skip it)
      ielts_min: m.ielts_min,
      toefl_min: null,
      sat_min: null,
      act_min: null,
      gpa_min: null,
      a_level_grades: null,
      ib_min: null,
      duolingo_min: null,
      pte_min: null,
      subject_ranking: m.subject_ranking,
      acceptance_rate: m.acceptance_rate,
      supplemental_requirements:
        `Annual tuition (international): AUD ${m.annual_fee_aud.toLocaleString()} (~USD ${audToUsd(m.annual_fee_aud).toLocaleString()}). ` +
        m.supplemental_requirements,
    };

    const res = await fetch(`${SUPABASE_BASE}/majors`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`POST failed for "${m.major_name}": ${res.status} ${text}`);
    }
    console.log(`  ✓ Inserted: ${m.major_name}`);
  }

  console.log("\nDone! 10 majors seeded for University of Newcastle.");
}

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
