INSERT INTO public.majors (
  university_id, major_name, acceptance_rate, supplemental_requirements,
  subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min,
  a_level_grades, ib_min, atar_min, duolingo_min, pte_min
)
SELECT
  u.id,
  v.major_name, v.acceptance_rate, v.supplemental_requirements,
  v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min,
  v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Biomedical Science', null, 'Prerequisites: Year 12 Mathematics and Chemistry recommended', 'QS #111 (Medicine)', 6.5, 82, null, null, null, 'BBB', 30, 80.0, 125, 64),
  ('Commerce', null, 'Prerequisites: Year 12 Mathematics Methods or equivalent', 'QS #101-150 (Accounting & Finance)', 6.5, 82, null, null, null, 'BBB', 30, 80.0, 125, 64),
  ('Engineering (Honours)', null, 'Prerequisites: Year 12 Mathematics Methods and Physics or Chemistry required; 4-year honours program', 'QS #13 (Mineral & Mining Engineering)', 6.5, 82, null, null, null, 'AAB', 33, 88.0, 125, 64),
  ('Science', null, null, 'QS #77 (Overall)', 6.5, 82, null, null, null, 'BCC', 28, 75.0, 125, 64),
  ('Arts', null, null, null, 6.5, 82, null, null, null, 'BCC', 28, 75.0, 125, 64),
  ('Advanced Computer Science (Honours)', null, 'Prerequisites: Year 12 Mathematics Methods or equivalent; 4-year honours program', 'QS #251-300 (Computer Science)', 6.5, 82, null, null, null, 'AAB', 34, 90.0, 125, 64),
  ('Environmental Design', null, 'Pathway to Master of Architecture and Master of Landscape Architecture', null, 6.5, 82, null, null, null, 'BCC', 28, 75.0, 125, 64),
  ('Philosophy (Honours)', null, 'Highly competitive; research-intensive integrated honours degree with mentoring; 4-year program', 'QS #77 (Overall)', 6.5, 82, null, null, null, 'A*A*A', 40, 98.0, 125, 64),
  ('Biological Science', null, 'Prerequisites: Year 12 Biology, Chemistry, or Mathematics recommended', 'QS #30 (Anatomy & Physiology)', 6.5, 82, null, null, null, 'BBB', 30, 80.0, 125, 64),
  ('Sport and Exercise Sciences', null, 'Prerequisites: Year 12 Mathematics and one of Biology, Chemistry, or Physics recommended', 'QS Top 50 (Sports-related)', 6.5, 82, null, null, null, 'BBB', 30, 80.0, 125, 64)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking,
       ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades,
       ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'The University of Western Australia';
