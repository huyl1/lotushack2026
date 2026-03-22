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
   Recommendation — matches DB recommendations table
   ============================================================ */

export type Tier = "reach" | "match" | "safety";

export interface ScoreSection {
  score: number;       // 0-100
  description: string; // per-category AI rationale
}

export interface RecommendationScore {
  sections: {
    academicAlignment:       ScoreSection;
    financialSustainability: ScoreSection;
    studentSuccess:          ScoreSection;
    lifestyleCulture:        ScoreSection;
    admissionChance:         ScoreSection;
  };
  composite: number; // 0-100
  tier: Tier;
}

export interface Recommendation {
  id: string;
  student_state_id: string;
  major_id: string;
  match_category: Tier;
  description: string | null;
  // Weighted score components (each 0-100)
  academic_alignment: number | null;        // 35%
  financial_sustainability: number | null;  // 25%
  student_success: number | null;           // 15%
  lifestyle_culture: number | null;         // 15%
  admission_chance: number | null;          // 10%
  composite_score: number | null;           // Generated: AA×35% + FS×25% + SS×15% + LC×15% + AC×10%
  created_at: string;
  // Joined fields (from query)
  university?: University;
  major?: Major;
}

/* ============================================================
   Composite types for frontend views
   ============================================================ */

export interface StudentWithLatestState extends Student {
  latest_state: StudentState | null;
  state_count: number;
}

export interface InferenceRun {
  state_id: string;
  created_at: string;
  sat_score: number | null;
  act_score: number | null;
  gpa: number | null;
  ielts_score: number | null;
  rec_count: number;
}

export interface StudentDetail extends Student {
  states: StudentState[];
  inference_runs: InferenceRun[];
  tags: Tag[];
}

/* ============================================================
   Meetings — matches meetings / meeting_utterances / meeting_sentiments
   ============================================================ */

export type MeetingStatus = "waiting" | "active" | "ended";

export interface Meeting {
  id: string;
  student_id: string | null;
  title: string;
  language: string;
  status: MeetingStatus;
  host_name: string | null;
  created_by: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface MeetingUtterance {
  id: string;
  meeting_id: string;
  role: "host" | "guest";
  speaker: string | null;
  text: string;
  raw_text: string | null;
  timestamp_ms: number;
  created_at: string;
}

export interface MeetingSentiment {
  id: string;
  meeting_id: string;
  target_role: "guest" | "host";
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  emotions: string[] | null;
  reasoning: string | null;
  window_start_ms: number | null;
  window_end_ms: number | null;
  created_at: string;
}
