-- Part 1: University-level data for Université Catholique de Louvain (UCL)
UPDATE public.universities SET
  website_url = 'https://uclouvain.be/en/index.html',
  tuition_usd = 5000,
  overall_acceptance_rate = '45%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Non-EU deadline: April 30 for September intake via UCLouvain application portal. Numerus clausus applies to Medicine.',
  financial_aid = 'UCLouvain Excellence Scholarships, ARES development scholarships, Erasmus+, Belgian government grants for eligible students'
WHERE name = 'Université Catholique de Louvain (UCL)';

-- Part 2: Top 10 majors for Université Catholique de Louvain (UCL)
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking::integer, v.ielts_min::numeric, v.toefl_min::integer, NULL, NULL, NULL, NULL, v.ib_min::integer, NULL, NULL, NULL
FROM public.universities u
CROSS JOIN (VALUES
  ('Medicine',              '15%', 'Entrance exam required (numerus clausus)', NULL, NULL, NULL, '34'),
  ('Engineering',           '40%', NULL,                                        NULL, '6.5', '90', '30'),
  ('Computer Science',      '40%', NULL,                                        NULL, '6.5', '90', '30'),
  ('Law',                   '45%', NULL,                                        NULL, '6.5', '90', '30'),
  ('Economics and Management', '45%', NULL,                                     NULL, '6.5', '90', '30'),
  ('Psychology',            '45%', NULL,                                        NULL, '6.5', '90', '29'),
  ('Philosophy',            '55%', NULL,                                        NULL, '6.0', '85', '28'),
  ('Theology',              '60%', NULL,                                        NULL, '6.0', '85', '28'),
  ('Biomedical Engineering','35%', NULL,                                        NULL, '6.5', '90', '30'),
  ('Political Science',     '45%', NULL,                                        NULL, '6.5', '90', '29')
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, ib_min)
WHERE u.name = 'Université Catholique de Louvain (UCL)';
