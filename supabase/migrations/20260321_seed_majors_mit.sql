-- Update MIT university-level data
UPDATE public.universities SET
  website_url = 'https://mitadmissions.org/apply/',
  tuition_usd = 65500,
  overall_acceptance_rate = '4.5%',
  test_policy = 'Required',
  deadline_calendar = 'EA: Nov 1; RA: Jan 5',
  financial_aid = 'Need-blind for all students (domestic and international). Meets 100% of demonstrated financial need. Families with income under $200,000 attend tuition-free. Families under $100,000 pay $0 parent contribution. 87.7% of Class of 2025 graduated debt-free.'
WHERE name = 'Massachusetts Institute of Technology (MIT)';

-- Delete existing majors for MIT
DELETE FROM public.majors WHERE university_id = (SELECT id FROM public.universities WHERE name = 'Massachusetts Institute of Technology (MIT)');

-- Insert top 10 majors for MIT
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science and Engineering', '4.5%', 'No major-specific application; MIT admits by institution not major. Two letters of recommendation, 5 short-answer essays, activities list required.', 1, 7.0, 90, 1520, 34, 3.90, NULL::text, NULL::integer, NULL::numeric, 120, NULL::integer),
  ('Artificial Intelligence and Decision Making', '4.5%', 'No major-specific application; MIT admits by institution not major. Two letters of recommendation, 5 short-answer essays, activities list required.', NULL::integer, 7.0, 90, 1520, 34, 3.90, NULL::text, NULL::integer, NULL::numeric, 120, NULL::integer),
  ('Mathematics', '4.5%', 'No major-specific application; MIT admits by institution not major. Two letters of recommendation, 5 short-answer essays, activities list required.', 1, 7.0, 90, 1520, 34, 3.90, NULL::text, NULL::integer, NULL::numeric, 120, NULL::integer),
  ('Electrical Engineering and Computer Science', '4.5%', 'No major-specific application; MIT admits by institution not major. Two letters of recommendation, 5 short-answer essays, activities list required.', 1, 7.0, 90, 1520, 34, 3.90, NULL::text, NULL::integer, NULL::numeric, 120, NULL::integer),
  ('Mechanical Engineering', '4.5%', 'No major-specific application; MIT admits by institution not major. Two letters of recommendation, 5 short-answer essays, activities list required.', 1, 7.0, 90, 1520, 34, 3.90, NULL::text, NULL::integer, NULL::numeric, 120, NULL::integer),
  ('Physics', '4.5%', 'No major-specific application; MIT admits by institution not major. Two letters of recommendation, 5 short-answer essays, activities list required.', 1, 7.0, 90, 1520, 34, 3.90, NULL::text, NULL::integer, NULL::numeric, 120, NULL::integer),
  ('Aerospace Engineering', '4.5%', 'No major-specific application; MIT admits by institution not major. Two letters of recommendation, 5 short-answer essays, activities list required.', 1, 7.0, 90, 1520, 34, 3.90, NULL::text, NULL::integer, NULL::numeric, 120, NULL::integer),
  ('Mathematics with Computer Science', '4.5%', 'No major-specific application; MIT admits by institution not major. Two letters of recommendation, 5 short-answer essays, activities list required.', NULL::integer, 7.0, 90, 1520, 34, 3.90, NULL::text, NULL::integer, NULL::numeric, 120, NULL::integer),
  ('Biological Engineering', '4.5%', 'No major-specific application; MIT admits by institution not major. Two letters of recommendation, 5 short-answer essays, activities list required.', 4, 7.0, 90, 1520, 34, 3.90, NULL::text, NULL::integer, NULL::numeric, 120, NULL::integer),
  ('Finance', '4.5%', 'No major-specific application; MIT admits by institution not major. Two letters of recommendation, 5 short-answer essays, activities list required.', NULL::integer, 7.0, 90, 1520, 34, 3.90, NULL::text, NULL::integer, NULL::numeric, 120, NULL::integer)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Massachusetts Institute of Technology (MIT)';
