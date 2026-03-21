import type {
  Student,
  StudentState,
  StudentWithLatestState,
  University,
  Major,
  Recommendation,
  RecommendationScore,
  Tag,
  StudentDetail,
} from "@/lib/supabase/types";

/* ============================================================
   HELPER — deterministic UUID-like IDs
   ============================================================ */

function id(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(4, "0")}-0000-0000-000000000000`;
}

/* ============================================================
   STUDENTS — 18 students across all stages
   ============================================================ */

export const mockStudents: Student[] = [
  // NEW (3)
  { id: id("stu", 1), name: "Aisha Rahman", dob: "2008-09-14", grade: "11", stage: "new", created_at: "2026-03-19T08:00:00Z" },
  { id: id("stu", 2), name: "Liam O'Brien", dob: "2008-03-22", grade: "12", stage: "new", created_at: "2026-03-18T10:00:00Z" },
  { id: id("stu", 3), name: "Yuki Tanaka", dob: "2009-01-05", grade: "10", stage: "new", created_at: "2026-03-20T14:30:00Z" },

  // PROFILE BUILDING (5)
  { id: id("stu", 4), name: "Maria Santos", dob: "2008-03-15", grade: "12", stage: "profile_building", created_at: "2026-01-15T09:00:00Z" },
  { id: id("stu", 5), name: "James Chen", dob: "2008-07-10", grade: "12", stage: "profile_building", created_at: "2026-02-01T11:00:00Z" },
  { id: id("stu", 6), name: "Priya Patel", dob: "2008-11-28", grade: "11", stage: "profile_building", created_at: "2026-02-10T13:00:00Z" },
  { id: id("stu", 7), name: "Omar Hassan", dob: "2008-06-03", grade: "12", stage: "profile_building", created_at: "2026-02-20T09:30:00Z" },
  { id: id("stu", 8), name: "Sofia Petrova", dob: "2008-12-17", grade: "11", stage: "profile_building", created_at: "2026-03-01T10:00:00Z" },

  // MATCHED (5)
  { id: id("stu", 9), name: "Daniel Kim", dob: "2007-08-21", grade: "12", stage: "matched", created_at: "2025-10-05T08:00:00Z" },
  { id: id("stu", 10), name: "Emma Williams", dob: "2007-05-12", grade: "12", stage: "matched", created_at: "2025-11-15T09:00:00Z" },
  { id: id("stu", 11), name: "Raj Sharma", dob: "2007-09-30", grade: "12", stage: "matched", created_at: "2025-09-20T10:00:00Z" },
  { id: id("stu", 12), name: "Isabella Moreno", dob: "2008-02-14", grade: "12", stage: "matched", created_at: "2025-12-01T11:00:00Z" },
  { id: id("stu", 13), name: "Leo Nguyen", dob: "2007-11-08", grade: "12", stage: "matched", created_at: "2025-10-25T08:30:00Z" },

  // PRESENTED (2)
  { id: id("stu", 14), name: "Charlotte Dubois", dob: "2007-04-19", grade: "12", stage: "presented", created_at: "2025-08-10T09:00:00Z" },
  { id: id("stu", 15), name: "Arjun Mehta", dob: "2007-07-25", grade: "12", stage: "presented", created_at: "2025-07-15T10:00:00Z" },

  // DECIDED (2)
  { id: id("stu", 16), name: "Hannah Fischer", dob: "2007-01-30", grade: "12", stage: "decided", created_at: "2025-05-01T08:00:00Z" },
  { id: id("stu", 17), name: "Carlos Rivera", dob: "2007-06-11", grade: "12", stage: "decided", created_at: "2025-04-20T09:00:00Z" },

  // ARCHIVED (1)
  { id: id("stu", 18), name: "Mei-Lin Wong", dob: "2006-10-02", grade: "12", stage: "archived", created_at: "2024-09-01T08:00:00Z" },
];

/* ============================================================
   STUDENT STATES — 2-4 snapshots per active student
   ============================================================ */

export const mockStudentStates: StudentState[] = [
  // Maria Santos (profile_building) — 2 states showing SAT improvement
  {
    id: id("state", 1), student_id: id("stu", 4),
    sat_score: 1200, ielts_score: 6.5, gpa: 3.6, act_score: null,
    target_majors: ["Computer Science", "Data Science"], preferred_countries: ["US", "Canada"],
    preferred_setting: "urban", preferred_size: "large", budget_usd: 45000,
    needs_financial_aid: true, target_acceptance_rate_min: null, application_round: "Regular",
    created_at: "2026-01-20T10:00:00Z",
  },
  {
    id: id("state", 2), student_id: id("stu", 4),
    sat_score: 1350, ielts_score: 7.0, gpa: 3.7, act_score: null,
    target_majors: ["Computer Science", "Data Science"], preferred_countries: ["US", "Canada"],
    preferred_setting: "urban", preferred_size: "large", budget_usd: 50000,
    needs_financial_aid: true, target_acceptance_rate_min: null, application_round: "Regular",
    created_at: "2026-02-15T10:00:00Z",
  },

  // James Chen (profile_building) — 2 states
  {
    id: id("state", 3), student_id: id("stu", 5),
    sat_score: 1420, ielts_score: null, gpa: 3.8, act_score: 32,
    target_majors: ["Mechanical Engineering", "Physics"], preferred_countries: ["US", "UK"],
    preferred_setting: "suburban", preferred_size: "medium", budget_usd: 60000,
    needs_financial_aid: false, target_acceptance_rate_min: null, application_round: "Early Action",
    created_at: "2026-02-10T10:00:00Z",
  },
  {
    id: id("state", 4), student_id: id("stu", 5),
    sat_score: 1480, ielts_score: null, gpa: 3.9, act_score: 33,
    target_majors: ["Mechanical Engineering", "Aerospace Engineering"], preferred_countries: ["US", "UK"],
    preferred_setting: "suburban", preferred_size: "medium", budget_usd: 65000,
    needs_financial_aid: false, target_acceptance_rate_min: null, application_round: "Early Action",
    created_at: "2026-03-10T10:00:00Z",
  },

  // Priya Patel (profile_building) — 1 state
  {
    id: id("state", 5), student_id: id("stu", 6),
    sat_score: 1300, ielts_score: 7.5, gpa: 3.5, act_score: null,
    target_majors: ["Biology", "Pre-Med"], preferred_countries: ["US", "Canada", "Australia"],
    preferred_setting: "urban", preferred_size: "large", budget_usd: 40000,
    needs_financial_aid: true, target_acceptance_rate_min: 20, application_round: "Regular",
    created_at: "2026-02-20T10:00:00Z",
  },

  // Omar Hassan (profile_building) — 1 state
  {
    id: id("state", 6), student_id: id("stu", 7),
    sat_score: 1150, ielts_score: 6.0, gpa: 3.2, act_score: null,
    target_majors: ["Business Administration", "Economics"], preferred_countries: ["US", "UK", "UAE"],
    preferred_setting: "urban", preferred_size: "large", budget_usd: 55000,
    needs_financial_aid: false, target_acceptance_rate_min: null, application_round: "Regular",
    created_at: "2026-03-05T10:00:00Z",
  },

  // Sofia Petrova (profile_building) — 1 state
  {
    id: id("state", 7), student_id: id("stu", 8),
    sat_score: null, ielts_score: 8.0, gpa: 3.9, act_score: null,
    target_majors: ["International Relations", "Political Science"], preferred_countries: ["UK", "Netherlands", "Switzerland"],
    preferred_setting: "urban", preferred_size: "medium", budget_usd: 50000,
    needs_financial_aid: true, target_acceptance_rate_min: null, application_round: "Regular",
    created_at: "2026-03-10T10:00:00Z",
  },

  // Daniel Kim (matched) — 3 states showing progression
  {
    id: id("state", 8), student_id: id("stu", 9),
    sat_score: 1380, ielts_score: null, gpa: 3.7, act_score: 31,
    target_majors: ["Computer Science", "Mathematics"], preferred_countries: ["US"],
    preferred_setting: "urban", preferred_size: "large", budget_usd: 70000,
    needs_financial_aid: false, target_acceptance_rate_min: null, application_round: "Early Decision",
    created_at: "2025-10-15T10:00:00Z",
  },
  {
    id: id("state", 9), student_id: id("stu", 9),
    sat_score: 1450, ielts_score: null, gpa: 3.8, act_score: 33,
    target_majors: ["Computer Science", "Mathematics"], preferred_countries: ["US"],
    preferred_setting: "urban", preferred_size: "large", budget_usd: 70000,
    needs_financial_aid: false, target_acceptance_rate_min: null, application_round: "Early Decision",
    created_at: "2025-12-01T10:00:00Z",
  },
  {
    id: id("state", 10), student_id: id("stu", 9),
    sat_score: 1520, ielts_score: null, gpa: 3.9, act_score: 34,
    target_majors: ["Computer Science"], preferred_countries: ["US"],
    preferred_setting: "urban", preferred_size: "large", budget_usd: 75000,
    needs_financial_aid: false, target_acceptance_rate_min: null, application_round: "Early Decision",
    created_at: "2026-02-20T10:00:00Z",
  },

  // Emma Williams (matched) — 2 states
  {
    id: id("state", 11), student_id: id("stu", 10),
    sat_score: 1340, ielts_score: 7.0, gpa: 3.6, act_score: null,
    target_majors: ["Psychology", "Neuroscience"], preferred_countries: ["US", "UK"],
    preferred_setting: "suburban", preferred_size: "medium", budget_usd: 55000,
    needs_financial_aid: true, target_acceptance_rate_min: null, application_round: "Regular",
    created_at: "2025-12-01T10:00:00Z",
  },
  {
    id: id("state", 12), student_id: id("stu", 10),
    sat_score: 1400, ielts_score: 7.5, gpa: 3.7, act_score: null,
    target_majors: ["Psychology", "Neuroscience"], preferred_countries: ["US", "UK"],
    preferred_setting: "suburban", preferred_size: "medium", budget_usd: 55000,
    needs_financial_aid: true, target_acceptance_rate_min: null, application_round: "Regular",
    created_at: "2026-01-20T10:00:00Z",
  },

  // Raj Sharma (matched) — 3 states
  {
    id: id("state", 13), student_id: id("stu", 11),
    sat_score: 1500, ielts_score: null, gpa: 3.95, act_score: 35,
    target_majors: ["Electrical Engineering", "Computer Engineering"], preferred_countries: ["US"],
    preferred_setting: null, preferred_size: "large", budget_usd: 80000,
    needs_financial_aid: false, target_acceptance_rate_min: null, application_round: "Early Decision",
    created_at: "2025-10-01T10:00:00Z",
  },
  {
    id: id("state", 14), student_id: id("stu", 11),
    sat_score: 1550, ielts_score: null, gpa: 3.97, act_score: 36,
    target_majors: ["Electrical Engineering"], preferred_countries: ["US"],
    preferred_setting: null, preferred_size: "large", budget_usd: 80000,
    needs_financial_aid: false, target_acceptance_rate_min: null, application_round: "Early Decision",
    created_at: "2025-12-15T10:00:00Z",
  },

  // Isabella Moreno (matched) — 2 states
  {
    id: id("state", 15), student_id: id("stu", 12),
    sat_score: 1280, ielts_score: 7.0, gpa: 3.5, act_score: null,
    target_majors: ["Architecture", "Design"], preferred_countries: ["US", "Italy", "UK"],
    preferred_setting: "urban", preferred_size: "medium", budget_usd: 45000,
    needs_financial_aid: true, target_acceptance_rate_min: null, application_round: "Regular",
    created_at: "2026-01-05T10:00:00Z",
  },
  {
    id: id("state", 16), student_id: id("stu", 12),
    sat_score: 1320, ielts_score: 7.5, gpa: 3.6, act_score: null,
    target_majors: ["Architecture", "Urban Planning"], preferred_countries: ["US", "Italy", "UK"],
    preferred_setting: "urban", preferred_size: "medium", budget_usd: 48000,
    needs_financial_aid: true, target_acceptance_rate_min: null, application_round: "Regular",
    created_at: "2026-02-28T10:00:00Z",
  },

  // Leo Nguyen (matched) — 2 states
  {
    id: id("state", 17), student_id: id("stu", 13),
    sat_score: 1460, ielts_score: null, gpa: 3.85, act_score: 33,
    target_majors: ["Finance", "Economics"], preferred_countries: ["US", "UK"],
    preferred_setting: "urban", preferred_size: "large", budget_usd: 65000,
    needs_financial_aid: false, target_acceptance_rate_min: null, application_round: "Early Action",
    created_at: "2025-11-10T10:00:00Z",
  },
  {
    id: id("state", 18), student_id: id("stu", 13),
    sat_score: 1490, ielts_score: null, gpa: 3.9, act_score: 34,
    target_majors: ["Finance", "Economics", "Applied Mathematics"], preferred_countries: ["US", "UK"],
    preferred_setting: "urban", preferred_size: "large", budget_usd: 70000,
    needs_financial_aid: false, target_acceptance_rate_min: null, application_round: "Early Action",
    created_at: "2026-01-25T10:00:00Z",
  },

  // Charlotte Dubois (presented) — 3 states
  {
    id: id("state", 19), student_id: id("stu", 14),
    sat_score: 1380, ielts_score: 7.5, gpa: 3.7, act_score: null,
    target_majors: ["Art History", "French Literature"], preferred_countries: ["US", "France", "UK"],
    preferred_setting: "urban", preferred_size: "medium", budget_usd: 50000,
    needs_financial_aid: true, target_acceptance_rate_min: null, application_round: "Regular",
    created_at: "2025-09-01T10:00:00Z",
  },
  {
    id: id("state", 20), student_id: id("stu", 14),
    sat_score: 1420, ielts_score: 8.0, gpa: 3.8, act_score: null,
    target_majors: ["Art History", "Comparative Literature"], preferred_countries: ["US", "France", "UK"],
    preferred_setting: "urban", preferred_size: "medium", budget_usd: 55000,
    needs_financial_aid: true, target_acceptance_rate_min: null, application_round: "Regular",
    created_at: "2025-11-15T10:00:00Z",
  },

  // Arjun Mehta (presented) — 2 states
  {
    id: id("state", 21), student_id: id("stu", 15),
    sat_score: 1560, ielts_score: null, gpa: 4.0, act_score: 36,
    target_majors: ["Computer Science", "Artificial Intelligence"], preferred_countries: ["US"],
    preferred_setting: null, preferred_size: "large", budget_usd: 90000,
    needs_financial_aid: false, target_acceptance_rate_min: null, application_round: "Early Decision",
    created_at: "2025-08-01T10:00:00Z",
  },
  {
    id: id("state", 22), student_id: id("stu", 15),
    sat_score: 1580, ielts_score: null, gpa: 4.0, act_score: 36,
    target_majors: ["Computer Science", "Artificial Intelligence"], preferred_countries: ["US"],
    preferred_setting: null, preferred_size: "large", budget_usd: 90000,
    needs_financial_aid: false, target_acceptance_rate_min: null, application_round: "Early Decision",
    created_at: "2025-10-20T10:00:00Z",
  },

  // Hannah Fischer (decided) — 2 states
  {
    id: id("state", 23), student_id: id("stu", 16),
    sat_score: 1440, ielts_score: 8.0, gpa: 3.85, act_score: null,
    target_majors: ["Environmental Science", "Sustainability"], preferred_countries: ["US", "UK", "Netherlands"],
    preferred_setting: "suburban", preferred_size: "medium", budget_usd: 55000,
    needs_financial_aid: true, target_acceptance_rate_min: null, application_round: "Regular",
    created_at: "2025-06-01T10:00:00Z",
  },

  // Carlos Rivera (decided) — 2 states
  {
    id: id("state", 24), student_id: id("stu", 17),
    sat_score: 1360, ielts_score: 7.0, gpa: 3.6, act_score: null,
    target_majors: ["Business Administration", "Marketing"], preferred_countries: ["US", "Spain"],
    preferred_setting: "urban", preferred_size: "large", budget_usd: 50000,
    needs_financial_aid: true, target_acceptance_rate_min: null, application_round: "Regular",
    created_at: "2025-05-15T10:00:00Z",
  },
];

/* ============================================================
   MOCK UNIVERSITIES (for recommendations)
   ============================================================ */

function uni(n: number, name: string, country: string, rank: number, overrides: Partial<University> = {}): University {
  return {
    id: id("uni", n), name, country, qs_rank: rank,
    website_url: null, setting: null, size_category: null, tuition_usd: null,
    overall_acceptance_rate: null, test_policy: null, deadline_calendar: null,
    financial_aid: null, region: null, focus: null, research: null,
    ar_score: null, er_score: null, fsr_score: null, cpf_score: null,
    ifr_score: null, isr_score: null, isd_score: null, irn_score: null,
    eo_score: null, sus_score: null, overall_score: null,
    created_at: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

const mockUniversities: University[] = [
  uni(1, "Massachusetts Institute of Technology", "US", 1, { setting: "urban", size_category: "medium", tuition_usd: 82000, overall_acceptance_rate: "3.5%", test_policy: "Required", overall_score: 100, ar_score: 100, er_score: 100 }),
  uni(2, "Stanford University", "US", 2, { setting: "suburban", size_category: "medium", tuition_usd: 80000, overall_acceptance_rate: "3.7%", test_policy: "Required", overall_score: 98.5 }),
  uni(3, "University of Cambridge", "UK", 3, { setting: "urban", size_category: "large", tuition_usd: 45000, overall_acceptance_rate: "21%", test_policy: "Flexible", overall_score: 97.8, region: "Europe" }),
  uni(4, "University of California, Berkeley", "US", 12, { setting: "urban", size_category: "large", tuition_usd: 48000, overall_acceptance_rate: "11.6%", test_policy: "Test-Blind", overall_score: 82.1 }),
  uni(5, "University of Michigan", "US", 25, { setting: "suburban", size_category: "large", tuition_usd: 55000, overall_acceptance_rate: "18%", test_policy: "Optional", overall_score: 74.5 }),
  uni(6, "Georgia Institute of Technology", "US", 33, { setting: "urban", size_category: "large", tuition_usd: 42000, overall_acceptance_rate: "16%", test_policy: "Required", overall_score: 70.2 }),
  uni(7, "University of Toronto", "Canada", 21, { setting: "urban", size_category: "large", tuition_usd: 38000, overall_acceptance_rate: "43%", test_policy: "Optional", overall_score: 77.3, region: "North America" }),
  uni(8, "UCLA", "US", 15, { setting: "urban", size_category: "large", tuition_usd: 46000, overall_acceptance_rate: "8.6%", test_policy: "Test-Blind", overall_score: 80.5 }),
  uni(9, "University of Wisconsin-Madison", "US", 75, { setting: "urban", size_category: "large", tuition_usd: 40000, overall_acceptance_rate: "49%", test_policy: "Optional", overall_score: 55.8 }),
  uni(10, "Arizona State University", "US", 180, { setting: "urban", size_category: "large", tuition_usd: 32000, overall_acceptance_rate: "88%", test_policy: "Optional", overall_score: 35.2 }),
  uni(11, "Penn State University", "US", 95, { setting: "suburban", size_category: "large", tuition_usd: 38000, overall_acceptance_rate: "55%", test_policy: "Optional", overall_score: 50.1 }),
  uni(12, "Purdue University", "US", 60, { setting: "suburban", size_category: "large", tuition_usd: 42000, overall_acceptance_rate: "53%", test_policy: "Optional", overall_score: 58.3 }),
  uni(13, "Carnegie Mellon University", "US", 28, { setting: "urban", size_category: "medium", tuition_usd: 62000, overall_acceptance_rate: "11%", test_policy: "Required", overall_score: 72.8 }),
  uni(14, "Columbia University", "US", 7, { setting: "urban", size_category: "medium", tuition_usd: 68000, overall_acceptance_rate: "3.9%", test_policy: "Required", overall_score: 90.1 }),
  uni(15, "University of British Columbia", "Canada", 38, { setting: "urban", size_category: "large", tuition_usd: 35000, overall_acceptance_rate: "46%", test_policy: "Optional", overall_score: 67.5, region: "North America" }),
];

/* ============================================================
   MOCK RECOMMENDATIONS — for matched students
   ============================================================ */

function makeRec(
  studentId: string,
  uni: University,
  tier: "reach" | "match" | "safety",
  composite: number,
  sections: RecommendationScore["sections"],
  reasoning: string
): Recommendation {
  return {
    id: `rec-${studentId.slice(4, 8)}-${uni.id.slice(4, 8)}`,
    student_id: studentId,
    university: uni,
    major: null,
    score: { sections, composite, tier, reasoning },
    is_dismissed: false,
    created_at: "2026-03-15T10:00:00Z",
  };
}

export const mockRecommendations: Recommendation[] = [
  // Daniel Kim — CS-focused, strong scores (1520 SAT, 3.9 GPA)
  makeRec(id("stu", 9), mockUniversities[0], "reach", 38, {
    academicFit: { score: 72, summary: "SAT 1520 is within MIT's 25th-75th range. GPA 3.9 is competitive." },
    majorAlignment: { score: 95, summary: "MIT's CS program is ranked #1 globally. Perfect alignment." },
    financialFit: { score: 25, summary: "$82K tuition vs $75K budget. Limited aid for international students." },
    preferenceMatch: { score: 80, summary: "Urban campus, medium size — matches preferences well." },
    admissibility: { score: 8, summary: "3.5% acceptance rate makes this a significant reach regardless of scores." },
  }, "MIT is the dream school for any CS applicant, and Daniel's 1520 SAT places him within the admitted range. However, the 3.5% acceptance rate means most qualified applicants are rejected. His strong GPA of 3.9 and focused CS interest are positives, but the financial gap ($82K vs $75K budget) and extreme selectivity make this a clear Reach. Worth applying Early Decision if it's his top choice."),

  makeRec(id("stu", 9), mockUniversities[12], "match", 68, {
    academicFit: { score: 78, summary: "SAT 1520 is at the high end of CMU's range (1480-1560). Strong fit." },
    majorAlignment: { score: 90, summary: "CMU's School of Computer Science is world-class, ranked #2 in US." },
    financialFit: { score: 52, summary: "$62K tuition vs $75K budget. Comfortable margin, merit aid possible." },
    preferenceMatch: { score: 75, summary: "Urban campus in Pittsburgh. Medium size matches preferences." },
    admissibility: { score: 45, summary: "11% acceptance rate is selective but achievable with his profile." },
  }, "Carnegie Mellon is an excellent match for Daniel. His 1520 SAT sits comfortably within CMU's admitted range, and the CS program is one of the best in the world. At 11% acceptance, it's selective but realistic for a student with his academic profile. The $62K tuition is within budget with room for other costs. Strong Match."),

  makeRec(id("stu", 9), mockUniversities[3], "match", 62, {
    academicFit: { score: 80, summary: "SAT 1520 exceeds Berkeley's 75th percentile (1530). Very strong." },
    majorAlignment: { score: 85, summary: "Berkeley EECS is a top-5 CS program nationally." },
    financialFit: { score: 68, summary: "$48K tuition vs $75K budget. Strong financial fit." },
    preferenceMatch: { score: 90, summary: "Urban campus, large university — perfect preference match." },
    admissibility: { score: 35, summary: "11.6% acceptance rate, but test-blind policy means GPA weighs more." },
  }, "UC Berkeley's EECS program is a powerhouse, and Daniel's 3.9 GPA is his strongest asset here since Berkeley is test-blind. The $48K tuition fits well within his $75K budget. Urban campus and large university size align perfectly with his preferences. The 11.6% acceptance rate keeps this as a strong Match rather than a Safety."),

  makeRec(id("stu", 9), mockUniversities[5], "match", 58, {
    academicFit: { score: 82, summary: "SAT 1520 and GPA 3.9 exceed Georgia Tech's typical admitted range." },
    majorAlignment: { score: 80, summary: "Georgia Tech CS is top-10 nationally. Strong program." },
    financialFit: { score: 72, summary: "$42K tuition vs $75K budget. Excellent value proposition." },
    preferenceMatch: { score: 80, summary: "Urban Atlanta campus. Large university." },
    admissibility: { score: 48, summary: "16% acceptance rate with his scores puts him in a strong position." },
  }, "Georgia Tech offers one of the best CS programs at a more accessible price point. Daniel's scores significantly exceed the typical admitted profile, and at $42K the financial fit is strong. His urban preference aligns with Atlanta's campus. At 16% acceptance with his profile, this is a comfortable Match trending toward Safety."),

  makeRec(id("stu", 9), mockUniversities[8], "safety", 82, {
    academicFit: { score: 95, summary: "SAT 1520 and GPA 3.9 far exceed Wisconsin's ranges." },
    majorAlignment: { score: 70, summary: "UW-Madison has a solid CS program, though not top-tier." },
    financialFit: { score: 78, summary: "$40K tuition fits well within budget. Merit scholarships likely." },
    preferenceMatch: { score: 80, summary: "Urban campus, large university. Good fit." },
    admissibility: { score: 90, summary: "49% acceptance rate with his scores makes admission near-certain." },
  }, "UW-Madison is an excellent safety option. Daniel's 1520 SAT and 3.9 GPA place him well above the admitted profile, and the 49% acceptance rate makes admission nearly guaranteed. The CS program is respectable and improving. At $40K with likely merit aid, this is financially comfortable. A strong foundation to build on."),

  // Emma Williams — Psychology, moderate scores (1400 SAT, 3.7 GPA)
  makeRec(id("stu", 10), mockUniversities[7], "reach", 42, {
    academicFit: { score: 60, summary: "SAT 1400 is within UCLA's range but GPA 3.7 is at the lower end." },
    majorAlignment: { score: 85, summary: "UCLA's Psychology department is top-5 nationally." },
    financialFit: { score: 48, summary: "$46K vs $55K budget. Tight but possible with aid." },
    preferenceMatch: { score: 70, summary: "Urban LA campus. Large university — slightly larger than preferred." },
    admissibility: { score: 18, summary: "8.6% acceptance rate is highly selective." },
  }, "UCLA's psychology program is one of the best in the country, making it aspirational for Emma. Her 1400 SAT is competitive but not standout for UCLA's pool, and the 8.6% acceptance rate is daunting. Financial fit is tight at $46K against a $55K budget. This is a worthwhile Reach if she's passionate about their program."),

  makeRec(id("stu", 10), mockUniversities[4], "match", 64, {
    academicFit: { score: 72, summary: "SAT 1400 is within UMich's 50th percentile range. Competitive." },
    majorAlignment: { score: 78, summary: "Michigan's Psychology program is highly respected." },
    financialFit: { score: 50, summary: "$55K tuition exactly at budget. Financial aid needed." },
    preferenceMatch: { score: 85, summary: "Suburban campus, medium-large size. Great fit for her preferences." },
    admissibility: { score: 55, summary: "18% acceptance rate. Achievable with her profile." },
  }, "University of Michigan is a strong match for Emma's interests. The psychology program is nationally recognized, and her 1400 SAT puts her in the competitive range. The suburban campus fits her preferences well. At $55K, it's right at her budget limit — she'll want to apply for financial aid. The 18% acceptance rate is achievable."),

  makeRec(id("stu", 10), mockUniversities[10], "safety", 78, {
    academicFit: { score: 85, summary: "SAT 1400 and GPA 3.7 exceed Penn State's typical admitted profile." },
    majorAlignment: { score: 72, summary: "Penn State has a solid Psychology program with good research opportunities." },
    financialFit: { score: 68, summary: "$38K vs $55K budget. Comfortable margin." },
    preferenceMatch: { score: 80, summary: "Suburban campus matches her preference. Large university." },
    admissibility: { score: 88, summary: "55% acceptance rate. Near-certain admission with her scores." },
  }, "Penn State provides a comfortable safety option with a well-regarded Psychology program. Emma's scores exceed the admitted profile, making admission very likely. The $38K tuition leaves room in her budget for living expenses and the suburban campus matches her preferences. The research opportunities in psychology are strong for an undergraduate program."),

  // Raj Sharma — EE, top scores (1550 SAT, 3.97 GPA)
  makeRec(id("stu", 11), mockUniversities[0], "reach", 42, {
    academicFit: { score: 88, summary: "SAT 1550 and GPA 3.97 are within MIT's admitted range." },
    majorAlignment: { score: 92, summary: "MIT's EE program is world-class, ranked #1." },
    financialFit: { score: 45, summary: "$82K vs $80K budget. Tight but manageable." },
    preferenceMatch: { score: 65, summary: "Urban, medium campus. No setting preference specified." },
    admissibility: { score: 10, summary: "3.5% acceptance rate remains the bottleneck." },
  }, "Raj's exceptional scores place him in MIT's admitted range, and the EE program is the best in the world. However, the 3.5% acceptance rate means even perfect candidates face long odds. His $80K budget covers tuition but leaves little margin. A worthy Reach for someone of his caliber."),

  makeRec(id("stu", 11), mockUniversities[5], "match", 72, {
    academicFit: { score: 95, summary: "SAT 1550 and GPA 3.97 significantly exceed Georgia Tech's range." },
    majorAlignment: { score: 88, summary: "Georgia Tech's ECE program is top-5 nationally." },
    financialFit: { score: 80, summary: "$42K vs $80K budget. Very comfortable." },
    preferenceMatch: { score: 70, summary: "Urban campus, large university." },
    admissibility: { score: 52, summary: "16% acceptance rate with his scores puts him in strong position." },
  }, "Georgia Tech is an excellent match. Raj's scores far exceed the typical admitted profile, and the ECE program is among the best. At $42K against an $80K budget, the financial fit is strong. The 16% acceptance rate is very achievable with his profile."),

  makeRec(id("stu", 11), mockUniversities[11], "safety", 85, {
    academicFit: { score: 98, summary: "SAT 1550 and GPA 3.97 are far above Purdue's ranges." },
    majorAlignment: { score: 82, summary: "Purdue's EE program is well-respected, especially for research." },
    financialFit: { score: 80, summary: "$42K vs $80K budget. Strong financial fit." },
    preferenceMatch: { score: 75, summary: "Suburban campus, large university." },
    admissibility: { score: 92, summary: "53% acceptance rate. Admission essentially guaranteed." },
  }, "Purdue is an excellent safety with a strong EE program and very comfortable financial fit. Raj's scores make admission near-certain, and the research opportunities are substantial."),

  // Isabella Moreno — Architecture (1320 SAT, 3.6 GPA)
  makeRec(id("stu", 12), mockUniversities[2], "reach", 35, {
    academicFit: { score: 55, summary: "GPA 3.6 is below Cambridge's typical 3.8+ range." },
    majorAlignment: { score: 70, summary: "Cambridge has a respected Architecture program." },
    financialFit: { score: 50, summary: "$45K vs $48K budget. Very tight." },
    preferenceMatch: { score: 75, summary: "Urban campus in a historic city. Medium size." },
    admissibility: { score: 25, summary: "21% acceptance for international students is competitive." },
  }, "Cambridge's Architecture program is world-renowned, but Isabella's GPA of 3.6 falls below the typical admitted range. The budget is very tight at $45K vs $48K tuition. A stretch, but worth applying if Architecture at a historic institution is her dream."),

  makeRec(id("stu", 12), mockUniversities[4], "match", 58, {
    academicFit: { score: 65, summary: "SAT 1320 is within Michigan's range. GPA 3.6 is competitive." },
    majorAlignment: { score: 75, summary: "Taubman College of Architecture is highly regarded." },
    financialFit: { score: 42, summary: "$55K vs $48K budget. Over budget — aid needed." },
    preferenceMatch: { score: 70, summary: "Suburban campus, large university." },
    admissibility: { score: 52, summary: "18% acceptance rate. Competitive but achievable." },
  }, "Michigan's Taubman College is one of the best Architecture programs in the US. Isabella's scores are competitive, though the $55K tuition exceeds her budget — she'll need financial aid. The suburban campus doesn't perfectly match her urban preference."),

  makeRec(id("stu", 12), mockUniversities[6], "safety", 74, {
    academicFit: { score: 72, summary: "GPA 3.6 and IELTS 7.5 are competitive for U of T." },
    majorAlignment: { score: 68, summary: "U of T has a growing Architecture program." },
    financialFit: { score: 75, summary: "$38K vs $48K budget. Good margin." },
    preferenceMatch: { score: 85, summary: "Urban Toronto campus. Perfect fit for city preference." },
    admissibility: { score: 78, summary: "43% acceptance rate. Strong position." },
  }, "University of Toronto offers a solid Architecture program in one of the world's most vibrant cities. Isabella's IELTS 7.5 is strong, the budget fits comfortably, and the 43% acceptance rate makes this a comfortable safety."),

  // Leo Nguyen — Finance/Economics (1490 SAT, 3.9 GPA)
  makeRec(id("stu", 13), mockUniversities[13], "reach", 40, {
    academicFit: { score: 78, summary: "SAT 1490 is within Columbia's range but at the lower end." },
    majorAlignment: { score: 85, summary: "Columbia Business School feeder. Econ program is exceptional." },
    financialFit: { score: 40, summary: "$68K vs $70K budget. Almost no margin." },
    preferenceMatch: { score: 90, summary: "Urban NYC campus. Perfect for finance aspirations." },
    admissibility: { score: 12, summary: "3.9% acceptance rate is extremely selective." },
  }, "Columbia's Economics program is a direct pipeline to Wall Street, which aligns perfectly with Leo's Finance interests. His 1490 SAT is competitive but the 3.9% acceptance rate makes this a clear Reach. The $68K tuition nearly exhausts his $70K budget."),

  makeRec(id("stu", 13), mockUniversities[3], "match", 65, {
    academicFit: { score: 82, summary: "SAT 1490 exceeds Berkeley's range. GPA 3.9 is strong." },
    majorAlignment: { score: 80, summary: "Haas School of Business and Econ department are top-tier." },
    financialFit: { score: 72, summary: "$48K vs $70K budget. Comfortable." },
    preferenceMatch: { score: 85, summary: "Urban campus, large university. Perfect match." },
    admissibility: { score: 38, summary: "11.6% acceptance, test-blind. GPA is the key factor." },
  }, "UC Berkeley's Economics and Haas Business programs are among the best on the West Coast. Leo's 3.9 GPA is his strongest asset since Berkeley is test-blind. The urban Bay Area location is ideal for finance networking."),

  makeRec(id("stu", 13), mockUniversities[9], "safety", 82, {
    academicFit: { score: 95, summary: "SAT 1490 and GPA 3.9 far exceed ASU's typical range." },
    majorAlignment: { score: 70, summary: "W.P. Carey School of Business is solid and growing." },
    financialFit: { score: 88, summary: "$32K vs $70K budget. Excellent value." },
    preferenceMatch: { score: 80, summary: "Urban campus, large university." },
    admissibility: { score: 95, summary: "88% acceptance rate. Guaranteed admission." },
  }, "ASU's W.P. Carey School of Business offers strong finance programs at an excellent price point. Leo's scores guarantee admission, and the $32K tuition leaves significant budget headroom. A solid safety with good career outcomes."),

  // Charlotte Dubois — Art History (1420 SAT, 3.8 GPA, presented)
  makeRec(id("stu", 14), mockUniversities[13], "reach", 38, {
    academicFit: { score: 72, summary: "SAT 1420 is below Columbia's 50th percentile." },
    majorAlignment: { score: 88, summary: "Columbia's Art History department is world-class." },
    financialFit: { score: 35, summary: "$68K vs $55K budget. Significant gap without aid." },
    preferenceMatch: { score: 85, summary: "Urban NYC campus. Perfect for arts and culture." },
    admissibility: { score: 12, summary: "3.9% acceptance rate." },
  }, "Columbia's Art History program benefits from NYC's unparalleled museum and gallery access. Charlotte's scores are competitive but the 3.9% acceptance rate and $68K tuition create significant barriers. Financial aid would be essential."),

  makeRec(id("stu", 14), mockUniversities[7], "match", 62, {
    academicFit: { score: 75, summary: "SAT 1420 and GPA 3.8 are competitive for UCLA." },
    majorAlignment: { score: 78, summary: "UCLA's Art History program is strong with museum partnerships." },
    financialFit: { score: 52, summary: "$46K vs $55K budget. Tight but possible." },
    preferenceMatch: { score: 80, summary: "Urban LA campus. Great cultural scene." },
    admissibility: { score: 22, summary: "8.6% acceptance rate is highly selective." },
  }, "UCLA offers excellent Art History with connections to LA's rich cultural scene. Charlotte's scores are competitive, and the $46K tuition is within her budget. The 8.6% acceptance rate keeps this as a Match rather than Safety."),

  makeRec(id("stu", 14), mockUniversities[6], "safety", 76, {
    academicFit: { score: 78, summary: "GPA 3.8 and IELTS 8.0 are strong for U of T." },
    majorAlignment: { score: 72, summary: "U of T has a respected Art History program." },
    financialFit: { score: 75, summary: "$38K vs $55K budget. Good margin." },
    preferenceMatch: { score: 82, summary: "Urban Toronto. Vibrant cultural city." },
    admissibility: { score: 78, summary: "43% acceptance rate. Strong position." },
  }, "University of Toronto provides a comfortable safety with good Art History offerings in a culturally rich city. Charlotte's IELTS 8.0 is exceptional, and the financial fit works well."),

  // Arjun Mehta — CS/AI, top scores (1580 SAT, 4.0 GPA, presented)
  makeRec(id("stu", 15), mockUniversities[1], "reach", 45, {
    academicFit: { score: 95, summary: "SAT 1580 and GPA 4.0 are at the top of Stanford's range." },
    majorAlignment: { score: 98, summary: "Stanford CS and AI programs are arguably #1 globally." },
    financialFit: { score: 52, summary: "$80K vs $90K budget. Manageable." },
    preferenceMatch: { score: 70, summary: "Suburban campus, medium size." },
    admissibility: { score: 12, summary: "3.7% acceptance rate means most qualified applicants are rejected." },
  }, "Arjun has the scores for Stanford — his 1580 SAT and 4.0 GPA are in the top tier. The CS/AI program is arguably the best in the world. But the 3.7% acceptance rate means this is a Reach for everyone. His $90K budget comfortably covers tuition."),

  makeRec(id("stu", 15), mockUniversities[0], "reach", 43, {
    academicFit: { score: 95, summary: "SAT 1580 and GPA 4.0 are within MIT's top range." },
    majorAlignment: { score: 96, summary: "MIT CSAIL is the premier AI research lab." },
    financialFit: { score: 52, summary: "$82K vs $90K budget. Tight but feasible." },
    preferenceMatch: { score: 65, summary: "Urban campus, medium size." },
    admissibility: { score: 10, summary: "3.5% acceptance rate." },
  }, "MIT's CSAIL lab is the birthplace of modern AI research. Arjun's perfect scores make him as competitive as possible, but the 3.5% acceptance rate is the ultimate bottleneck."),

  makeRec(id("stu", 15), mockUniversities[12], "match", 72, {
    academicFit: { score: 98, summary: "SAT 1580 and GPA 4.0 exceed CMU's range significantly." },
    majorAlignment: { score: 95, summary: "CMU's School of Computer Science is legendary for AI." },
    financialFit: { score: 65, summary: "$62K vs $90K budget. Very comfortable." },
    preferenceMatch: { score: 70, summary: "Urban Pittsburgh campus. Medium size." },
    admissibility: { score: 48, summary: "11% acceptance rate. Very achievable with his profile." },
  }, "Carnegie Mellon's CS program is world-class and its AI research is exceptional. Arjun's scores put him at the very top of the applicant pool. The 11% acceptance rate is challenging but highly achievable for someone with a 4.0 GPA and 1580 SAT. Excellent value at $62K."),

  makeRec(id("stu", 15), mockUniversities[3], "match", 68, {
    academicFit: { score: 95, summary: "GPA 4.0 is exceptional for Berkeley's test-blind admissions." },
    majorAlignment: { score: 88, summary: "Berkeley EECS is a powerhouse for CS and AI." },
    financialFit: { score: 78, summary: "$48K vs $90K budget. Excellent value." },
    preferenceMatch: { score: 75, summary: "Urban campus, large university." },
    admissibility: { score: 38, summary: "11.6% acceptance rate. Strong but not guaranteed." },
  }, "UC Berkeley's EECS program is among the best, and Arjun's 4.0 GPA is his key advantage since Berkeley is test-blind. The $48K tuition offers exceptional value against his budget. Urban Bay Area location provides great tech industry access."),

  makeRec(id("stu", 15), mockUniversities[5], "safety", 85, {
    academicFit: { score: 98, summary: "SAT 1580 and GPA 4.0 far exceed Georgia Tech's ranges." },
    majorAlignment: { score: 85, summary: "Georgia Tech's CS program is top-10 nationally." },
    financialFit: { score: 82, summary: "$42K vs $90K budget. Very comfortable." },
    preferenceMatch: { score: 75, summary: "Urban Atlanta campus. Large university." },
    admissibility: { score: 58, summary: "16% acceptance rate with his scores is near-certain." },
  }, "Georgia Tech offers a top-tier CS program at an excellent price. Arjun's perfect scores make admission virtually guaranteed. A strong safety that still provides world-class CS education and research opportunities."),
];

/* ============================================================
   MOCK TAGS
   ============================================================ */

export const mockTags: Tag[] = [
  { id: id("tag", 1), name: "High Priority", category: "status", emoji: null, description: "Needs immediate attention", created_at: "2025-01-01T00:00:00Z" },
  { id: id("tag", 2), name: "Scholarship Candidate", category: "academic", emoji: null, description: "Strong candidate for merit scholarships", created_at: "2025-01-01T00:00:00Z" },
  { id: id("tag", 3), name: "International", category: "background", emoji: null, description: "International student applicant", created_at: "2025-01-01T00:00:00Z" },
  { id: id("tag", 4), name: "STEM Focus", category: "academic", emoji: null, description: "Primarily interested in STEM fields", created_at: "2025-01-01T00:00:00Z" },
  { id: id("tag", 5), name: "Arts & Humanities", category: "academic", emoji: null, description: "Primarily interested in arts/humanities", created_at: "2025-01-01T00:00:00Z" },
];

/* ============================================================
   DATA ACCESS FUNCTIONS — mock implementations
   ============================================================ */

export function getStudentsWithLatestState(): StudentWithLatestState[] {
  return mockStudents.map((student) => {
    const states = mockStudentStates
      .filter((s) => s.student_id === student.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      ...student,
      latest_state: states[0] ?? null,
      state_count: states.length,
    };
  });
}

export function getStudentDetail(studentId: string): StudentDetail | null {
  const student = mockStudents.find((s) => s.id === studentId);
  if (!student) return null;

  const states = mockStudentStates
    .filter((s) => s.student_id === studentId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const recommendations = mockRecommendations
    .filter((r) => r.student_id === studentId)
    .sort((a, b) => b.score.composite - a.score.composite);

  return {
    ...student,
    states,
    recommendations,
    tags: [], // TBD — team member defining tag assignments
  };
}

export function getRecommendationsForStudent(studentId: string): Recommendation[] {
  return mockRecommendations
    .filter((r) => r.student_id === studentId && !r.is_dismissed)
    .sort((a, b) => b.score.composite - a.score.composite);
}

export function getDashboardStats() {
  const students = mockStudents.filter((s) => s.stage !== "archived");
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return {
    total: students.length,
    active: students.filter((s) =>
      ["profile_building", "matched"].includes(s.stage)
    ).length,
    needsAttention: students.filter((s) => {
      const states = mockStudentStates.filter((st) => st.student_id === s.id);
      const latestState = states.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      if (!latestState) return s.stage === "new";
      const staleDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      return new Date(latestState.created_at) < staleDate;
    }).length,
    recentlyActive: students.filter((s) => {
      const states = mockStudentStates.filter((st) => st.student_id === s.id);
      return states.some((st) => new Date(st.created_at) > sevenDaysAgo);
    }).length,
  };
}
