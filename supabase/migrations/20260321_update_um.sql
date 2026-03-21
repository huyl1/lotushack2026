-- Update Universiti Malaya (UM) university-level data (6 fields)
UPDATE public.universities SET
  website_url = 'https://study.um.edu.my',
  tuition_usd = 5500,
  overall_acceptance_rate = '~34%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Sem I (Oct intake): Feb-May; Sem II (Mar intake): Sep 8 - Jan 30',
  financial_aid = 'Malaysian International Scholarship (MIS) - full tuition + living allowance. ASEAN-Maybank Scholarship (full tuition + allowance). Commonwealth Scholarships available. Merit-based partial tuition waivers. Government-linked scholarships (MEXT, bilateral) for select nationalities.'
WHERE name = 'Universiti Malaya (UM)';

-- Delete existing majors for UM
DELETE FROM public.majors
WHERE university_id = (SELECT id FROM public.universities WHERE name = 'Universiti Malaya (UM)');

-- Insert 10 updated majors for Universiti Malaya (UM)
-- subject_ranking is INTEGER in live DB; IB/A-Levels accepted; fees converted MYR->USD at ~4.47 rate
INSERT INTO public.majors (
  university_id, major_name, acceptance_rate, supplemental_requirements,
  subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min,
  a_level_grades, ib_min, atar_min, duolingo_min, pte_min
)
SELECT
  u.id,
  v.major_name, v.acceptance_rate, v.supplemental_requirements,
  v.subject_ranking::INTEGER, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min,
  v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Medicine (MBBS)',                            NULL, 'Highly competitive; A-Level AAA in Biology and Chemistry required; interview required. 5-year program. International total fees ~RM 673200 (~USD 150600). Faculty screening required.',                                                    123, 6.5, 90,  NULL, NULL, 3.5, 'AAA', 38, NULL, NULL, 65),
  ('Computer Science (Artificial Intelligence)', NULL, 'A-Level BB with Mathematics required. QS Top 50 globally in Data Science and AI. International fees ~MYR 24567/yr (~USD 5500/yr). 3.5-year program.',                                                                                   50,  6.0, 80,  NULL, NULL, 3.0, 'BB',  35, NULL, NULL, 57),
  ('Electrical & Electronic Engineering',        NULL, 'A-Level BB with Mathematics and Physics required. 4-year program. International fees ~MYR 22000/yr (~USD 4900/yr). Engineering and Technology ranked 79th globally by QS 2025.',                                                        79,  6.0, 80,  NULL, NULL, 3.0, 'BB',  35, NULL, NULL, 57),
  ('Civil Engineering',                          NULL, 'A-Level BB with Mathematics and Physics required. 4-year program. International fees ~MYR 22000/yr (~USD 4900/yr). Civil Engineering ranked 68th globally (US News 2025).',                                                             68,  6.0, 80,  NULL, NULL, 3.0, 'BB',  35, NULL, NULL, 57),
  ('Business Administration',                    NULL, 'Standard entry; A-Level BB or equivalent. AACSB and AMBA accredited. 3-year program. International fees ~MYR 17200/yr (~USD 3850/yr).',                                                                                                 106, 6.0, 80,  NULL, NULL, 3.0, 'BB',  35, NULL, NULL, 57),
  ('Law',                                        NULL, 'A-Level BB required; strong English proficiency essential. 4-year program. International fees ~MYR 18400/yr (~USD 4100/yr). Top law school in Malaysia.',                                                                               75,  6.5, 90,  NULL, NULL, 3.0, 'BB',  35, NULL, NULL, 63),
  ('Chemical Engineering',                       NULL, 'A-Level BB with Mathematics and Chemistry required. 4-year program. International fees ~MYR 22000/yr (~USD 4900/yr). Engineering and Technology QS rank 79th globally.',                                                                79,  6.0, 80,  NULL, NULL, 3.0, 'BB',  35, NULL, NULL, 57),
  ('Accounting',                                 NULL, 'A-Level BB required; strong quantitative background recommended. AACSB accredited. 3.5-year program. International fees ~MYR 22000/yr (~USD 4900/yr).',                                                                                 63,  6.0, 80,  NULL, NULL, 3.0, 'BB',  35, NULL, NULL, 57),
  ('Pharmacy',                                   NULL, 'A-Level BB with Chemistry and Biology required; interview may be required. 4-year program. International fees ~MYR 29600/yr (~USD 6600/yr). MQA accredited.',                                                                           80,  6.0, 80,  NULL, NULL, 3.0, 'BB',  35, NULL, NULL, 57),
  ('Education (TESL)',                           NULL, 'A-Level BB with strong English required. Teaching English as Second Language specialization. QS Top 50 globally for Education (2025). 4-year program. International fees ~MYR 13600/yr (~USD 3000/yr).',                               38,  6.5, 90,  NULL, NULL, 3.0, 'BB',  35, NULL, NULL, 63)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Universiti Malaya (UM)';
