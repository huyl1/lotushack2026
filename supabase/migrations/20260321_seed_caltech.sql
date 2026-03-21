-- Update university-level data for California Institute of Technology (Caltech)
UPDATE public.universities SET
  website_url = 'https://www.admissions.caltech.edu/',
  tuition_usd = 65544,
  overall_acceptance_rate = '2.6%',
  test_policy = 'Required',
  deadline_calendar = 'REA: Nov 1; RD: Jan 5',
  financial_aid = 'Need-blind for domestic, need-aware for international. Meets 100% of demonstrated need. Families earning under $100k: full tuition, fees, room, and board covered. Families under $200k: full tuition covered. Average financial aid package ~$48,400. 75% of students receive institutional grants.'
WHERE name = 'California Institute of Technology (Caltech)';

-- Delete existing majors for Caltech
DELETE FROM public.majors WHERE university_id = (SELECT id FROM public.universities WHERE name = 'California Institute of Technology (Caltech)');

-- Insert top 10 majors for Caltech
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science', '2.6%', 'SAT/ACT required (superscored). Two teacher evaluations (one STEM, one humanities). Three short-answer essays and one longer essay. Research or maker portfolio encouraged.', 4, 7.0, 100, 1530, 35, 3.9, 'A*A*A*', 43, NULL::numeric, 130, 73),
  ('Mechanical Engineering', '2.6%', 'SAT/ACT required (superscored). Two teacher evaluations (one STEM, one humanities). Three short-answer essays and one longer essay. Research or maker portfolio encouraged.', 12, 7.0, 100, 1530, 35, 3.9, 'A*A*A*', 43, NULL::numeric, 130, 73),
  ('Physics', '2.6%', 'SAT/ACT required (superscored). Two teacher evaluations (one STEM, one humanities). Three short-answer essays and one longer essay. Research or maker portfolio encouraged.', 1, 7.0, 100, 1530, 35, 3.9, 'A*A*A*', 43, NULL::numeric, 130, 73),
  ('Bioengineering and Biomedical Engineering', '2.6%', 'SAT/ACT required (superscored). Two teacher evaluations (one STEM, one humanities). Three short-answer essays and one longer essay. Research or maker portfolio encouraged.', 15, 7.0, 100, 1530, 35, 3.9, 'A*A*A*', 43, NULL::numeric, 130, 73),
  ('Electrical Engineering', '2.6%', 'SAT/ACT required (superscored). Two teacher evaluations (one STEM, one humanities). Three short-answer essays and one longer essay. Research or maker portfolio encouraged.', 9, 7.0, 100, 1530, 35, 3.9, 'A*A*A*', 43, NULL::numeric, 130, 73),
  ('Applied and Computational Mathematics', '2.6%', 'SAT/ACT required (superscored). Two teacher evaluations (one STEM, one humanities). Three short-answer essays and one longer essay. Research or maker portfolio encouraged.', 6, 7.0, 100, 1530, 35, 3.9, 'A*A*A*', 43, NULL::numeric, 130, 73),
  ('Mathematics', '2.6%', 'SAT/ACT required (superscored). Two teacher evaluations (one STEM, one humanities). Three short-answer essays and one longer essay. Research or maker portfolio encouraged.', 6, 7.0, 100, 1530, 35, 3.9, 'A*A*A*', 43, NULL::numeric, 130, 73),
  ('Neuroscience and Neurobiology', '2.6%', 'SAT/ACT required (superscored). Two teacher evaluations (one STEM, one humanities). Three short-answer essays and one longer essay. Research or maker portfolio encouraged.', 20, 7.0, 100, 1530, 35, 3.9, 'A*A*A*', 43, NULL::numeric, 130, 73),
  ('Chemical Engineering', '2.6%', 'SAT/ACT required (superscored). Two teacher evaluations (one STEM, one humanities). Three short-answer essays and one longer essay. Research or maker portfolio encouraged.', 3, 7.0, 100, 1530, 35, 3.9, 'A*A*A*', 43, NULL::numeric, 130, 73),
  ('Chemistry', '2.6%', 'SAT/ACT required (superscored). Two teacher evaluations (one STEM, one humanities). Three short-answer essays and one longer essay. Research or maker portfolio encouraged.', 3, 7.0, 100, 1530, 35, 3.9, 'A*A*A*', 43, NULL::numeric, 130, 73)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'California Institute of Technology (Caltech)';
