/* ============================================================
   Database Types — matches live Supabase schema (2026-03-21)
   ============================================================ */

export type StudentStage =
  | "new"
  | "profile_building"
  | "matched"
  | "presented"
  | "decided"
  | "archived";

export interface Student {
  id: string;
  name: string;
  dob: string | null;
  grade: string | null;
  stage: StudentStage;
  created_at: string;
}

export interface StudentState {
  id: string;
  student_id: string;
  sat_score: number | null;
  ielts_score: number | null;
  gpa: number | null;
  act_score: number | null;
  target_majors: string[] | null;
  preferred_countries: string[] | null;
  preferred_setting: string | null;
  preferred_size: string | null;
  budget_usd: number | null;
  needs_financial_aid: boolean | null;
  target_acceptance_rate_min: number | null;
  application_round: string | null;
  created_at: string;
}

export interface University {
  id: string;
  name: string;
  country: string | null;
  qs_rank: number | null;
  website_url: string | null;
  setting: string | null;
  size_category: string | null;
  tuition_usd: number | null;
  overall_acceptance_rate: string | null;
  test_policy: string | null;
  deadline_calendar: string | null;
  financial_aid: string | null;
  // Geographic & profile
  region: string | null;
  focus: string | null;
  research: string | null;
  // QS indicator scores (0-100)
  ar_score: number | null;   // Academic Reputation
  er_score: number | null;   // Employer Reputation
  fsr_score: number | null;  // Faculty/Student Ratio
  cpf_score: number | null;  // Citations per Faculty
  ifr_score: number | null;  // International Faculty Ratio
  isr_score: number | null;  // International Students Ratio
  isd_score: number | null;  // International Student Diversity (placeholder)
  irn_score: number | null;  // International Research Network
  eo_score: number | null;   // Employment Outcomes
  sus_score: number | null;  // Sustainability
  overall_score: number | null;
  created_at: string;
}

export interface Major {
  id: string;
  university_id: string;
  major_name: string;
  acceptance_rate: string | null;
  supplemental_requirements: string | null;
  subject_ranking: number | null;
  // Admission minimums per major
  ielts_min: number | null;
  toefl_min: number | null;
  sat_min: number | null;
  act_min: number | null;
  gpa_min: number | null;
  a_level_grades: string | null;
  ib_min: number | null;
  atar_min: number | null;
  duolingo_min: number | null;
  pte_min: number | null;
}

export interface Tag {
  id: string;
  name: string;
  category: string | null;
  emoji: string | null;
  description: string | null;
  created_at: string;
}

/* ============================================================
   Recommendation Types — algorithm-agnostic contract
   ============================================================ */

export type Tier = "reach" | "match" | "safety";

export interface ScoreSection {
  score: number; // 0-100
  summary: string;
}

export interface RecommendationScore {
  sections: {
    academicFit: ScoreSection;
    majorAlignment: ScoreSection;
    financialFit: ScoreSection;
    preferenceMatch: ScoreSection;
    admissibility: ScoreSection;
  };
  composite: number; // 0-100
  tier: Tier;
  reasoning: string; // AI-generated narrative
}

export interface Recommendation {
  id: string;
  student_id: string;
  university: University;
  major: Major | null;
  score: RecommendationScore;
  is_dismissed: boolean;
  created_at: string;
}

/* ============================================================
   Composite types for frontend views
   ============================================================ */

export interface StudentWithLatestState extends Student {
  latest_state: StudentState | null;
  state_count: number;
}

export interface StudentDetail extends Student {
  states: StudentState[];
  recommendations: Recommendation[];
  tags: Tag[];
}
