-- Part 1: Update University of Chicago university record
UPDATE public.universities
SET
  website_url = 'https://collegeadmissions.uchicago.edu/',
  tuition_usd = 71325,
  overall_acceptance_rate = '4.48%',
  test_policy = 'Test-optional (No Harm policy: scores reviewed only if they strengthen application)',
  deadline_calendar = 'ED1: Nov 1; EA: Nov 1; ED2: Jan 6; RD: Jan 6',
  financial_aid = 'Need-blind for domestic students; need-aware for international. Meets 100% of demonstrated need. Free tuition for families earning under $125K/yr. Tuition + room + board covered for families under $60K/yr. ~60% of students receive aid; avg need-based grant $67,505.'
WHERE name = 'University of Chicago';

-- Part 2: Replace majors
DELETE FROM public.majors WHERE university_id = (SELECT id FROM public.universities WHERE name = 'University of Chicago');

INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Economics', '4.48%', 'UChicago Supplement: ''Why UChicago'' essay + one extended essay from prompts; two teacher recs; counselor rec; No Harm test-optional policy', 4, 7.0, 104, 1510, 34, 3.9, 'A*A*A', 42, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Computer Science', '4.48%', 'UChicago Supplement: ''Why UChicago'' essay + one extended essay from prompts; two teacher recs; counselor rec; No Harm test-optional policy', 23, 7.0, 104, 1510, 34, 3.9, 'A*A*A', 42, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Mathematics', '4.48%', 'UChicago Supplement: ''Why UChicago'' essay + one extended essay from prompts; two teacher recs; counselor rec; No Harm test-optional policy', 15, 7.0, 104, 1510, 34, 3.9, 'A*A*A', 42, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Biological Sciences', '4.48%', 'UChicago Supplement: ''Why UChicago'' essay + one extended essay from prompts; two teacher recs; counselor rec; No Harm test-optional policy', 21, 7.0, 104, 1510, 34, 3.9, 'A*A*A', 42, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Political Science', '4.48%', 'UChicago Supplement: ''Why UChicago'' essay + one extended essay from prompts; two teacher recs; counselor rec; No Harm test-optional policy', 16, 7.0, 104, 1510, 34, 3.9, 'A*A*A', 42, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Psychology', '4.48%', 'UChicago Supplement: ''Why UChicago'' essay + one extended essay from prompts; two teacher recs; counselor rec; No Harm test-optional policy', 10, 7.0, 104, 1510, 34, 3.9, 'A*A*A', 42, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Public Policy Studies', '4.48%', 'UChicago Supplement: ''Why UChicago'' essay + one extended essay from prompts; two teacher recs; counselor rec; Harris School of Public Policy affiliation; No Harm test-optional policy', 9, 7.0, 104, 1510, 34, 3.9, 'A*A*A', 42, NULL::NUMERIC, 120, NULL::INTEGER),
  ('History', '4.48%', 'UChicago Supplement: ''Why UChicago'' essay + one extended essay from prompts; two teacher recs; counselor rec; No Harm test-optional policy', 12, 7.0, 104, 1510, 34, 3.9, 'A*A*A', 42, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Neuroscience', '4.48%', 'UChicago Supplement: ''Why UChicago'' essay + one extended essay from prompts; two teacher recs; counselor rec; interdisciplinary program through BSD; No Harm test-optional policy', 20, 7.0, 104, 1510, 34, 3.9, 'A*A*A', 42, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Physics', '4.48%', 'UChicago Supplement: ''Why UChicago'' essay + one extended essay from prompts; two teacher recs; counselor rec; No Harm test-optional policy', 18, 7.0, 104, 1510, 34, 3.9, 'A*A*A', 42, NULL::NUMERIC, 120, NULL::INTEGER)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'University of Chicago';
