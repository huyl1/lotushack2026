-- Part 1: Update Hebrew University of Jerusalem university record
UPDATE public.universities
SET
  website_url = 'https://international.huji.ac.il/undergraduate',
  tuition_usd = 11000,
  overall_acceptance_rate = '45%',
  test_policy = 'Not applicable',
  deadline_calendar = 'October intake: apply by April 30 (international)',
  financial_aid = 'Need-aware. Rector''s Scholarship for international outstanding students. Hebrew University International Student Scholarship: partial tuition waiver. Funds for Israel scholarships available through external donors. Limited merit-based aid for high-achieving international applicants.'
WHERE name = 'Hebrew University of Jerusalem';

-- Part 2: Insert 10 undergraduate majors for Hebrew University of Jerusalem
-- Israeli university: SAT/ACT/ATAR not required (NULL). ILS tuition converted to USD (~3.65 ILS/USD).
-- English-taught international undergraduate programs via HUJI International School.
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science', '40%', 'Personal statement; 2 academic references; strong mathematics background required; interview may be requested', 101, 6.5, 87, NULL::INTEGER, NULL::INTEGER, 3.3, 'ABB', 32, NULL::NUMERIC, NULL::INTEGER, 58),
  ('Mathematics', '45%', 'Personal statement; 2 academic references; strong pre-calculus and algebra background required', 151, 6.5, 87, NULL, NULL, 3.3, 'ABB', 32, NULL, NULL, 58),
  ('Life Sciences (Biology)', '45%', 'Personal statement; 2 academic references; biology and chemistry background required', 101, 6.5, 87, NULL, NULL, 3.3, 'ABB', 32, NULL, NULL, 58),
  ('Psychology', '50%', 'Personal statement; 2 academic references; motivation letter describing research interests', 151, 6.5, 87, NULL, NULL, 3.0, 'BBB', 32, NULL, NULL, 58),
  ('Economics', '50%', 'Personal statement; 2 academic references; mathematics proficiency required', 201, 6.5, 87, NULL, NULL, 3.0, 'BBB', 32, NULL, NULL, 58),
  ('Political Science & International Relations', '55%', 'Personal statement; 2 academic references; writing sample or essay on current affairs topic', NULL, 6.5, 87, NULL, NULL, 3.0, 'BBB', 32, NULL, NULL, 58),
  ('Biochemistry', '40%', 'Personal statement; 2 academic references; chemistry and biology background required; laboratory experience preferred', 101, 6.5, 87, NULL, NULL, 3.3, 'ABB', 32, NULL, NULL, 58),
  ('Philosophy', '55%', 'Personal statement; 2 academic references; writing sample demonstrating analytical reasoning', NULL, 6.5, 87, NULL, NULL, 3.0, 'BBB', 32, NULL, NULL, 58),
  ('Environmental Studies', '50%', 'Personal statement; 2 academic references; background in natural sciences required', NULL, 6.5, 87, NULL, NULL, 3.0, 'BBB', 32, NULL, NULL, 58),
  ('History', '55%', 'Personal statement; 2 academic references; writing sample or essay on historical topic required', NULL, 6.5, 87, NULL, NULL, 3.0, 'BBB', 32, NULL, NULL, 58)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Hebrew University of Jerusalem';
