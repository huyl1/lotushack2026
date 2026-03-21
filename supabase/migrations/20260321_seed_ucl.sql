-- Part 1: University-level data for UCL (University College London)
UPDATE public.universities SET
  website_url = 'https://www.ucl.ac.uk/prospective-students/undergraduate',
  tuition_usd = 44500,
  overall_acceptance_rate = '33.7%',
  test_policy = 'Not applicable',
  deadline_calendar = 'UCAS deadline: January 29 (18:00 GMT) for most undergraduate courses. Medicine (MBBS): October 15 via UCAS. Equal consideration for all applications received by deadline. No early action or early decision. Deferred entry applications accepted. International qualifications assessed on equivalent basis.',
  financial_aid = 'UCL Global Undergraduate Scholarship: up to 33 awards per year — 10 covering full tuition fees plus maintenance allowance and fixed allowance for visa/IHS costs, 23 covering full tuition fees only, 3 specifically for Indian students (full tuition). Need-based for international students from low-income backgrounds. UCL Access Opportunity Scholarship for asylum seekers/refugees. UCL Humanitarian Scholarship for students displaced by armed conflict (postgrad). Chevening Scholarship (full tuition + living costs, UK government-funded). Various departmental scholarships and bursaries. UK Home students eligible for government tuition fee loans and means-tested maintenance loans.'
WHERE name = 'UCL (University College London)';

-- Part 2: Delete existing majors for UCL (University College London)
DELETE FROM public.majors WHERE university_id = (SELECT id FROM public.universities WHERE name = 'UCL (University College London)');

-- Part 3: Insert top 10 majors for UCL (University College London)
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('BSc Computer Science', '11.4%', 'A* in either Mathematics or Further Mathematics required. GCSE English Language and Mathematics at grade C/4. Personal statement assessed for problem-solving ability and genuine interest in computing. Strong GCSE profile expected.', 1, 6.5, 92, NULL::int, NULL::int, NULL::numeric, 'A*A*A', 40, NULL::numeric, NULL::int, 75),
  ('LLB Laws', '12.9%', 'No specific A-Level subjects required but essay-based subjects valued. GCSE English Language and Mathematics at grade C/4. LNAT not required but strong personal statement demonstrating analytical ability and interest in law essential. Resits not accepted.', 6, 7.5, 109, NULL, NULL, NULL, 'A*AA', 39, NULL, NULL, 75),
  ('BSc Economics', '~20%', 'A* in A-Level Mathematics required. GCSE English Language and Mathematics at grade C/4. Personal statement should demonstrate genuine interest in economics and analytical reasoning. Resits not accepted.', 8, 7.0, 100, NULL, NULL, NULL, 'A*AA', 39, NULL, NULL, 75),
  ('BSc Statistical Science', '13.5%', 'A* in A-Level Mathematics required; Further Mathematics highly desirable. GCSE English Language and Mathematics at grade C/4. Personal statement should demonstrate strong quantitative skills. Resits not accepted.', NULL, 6.5, 92, NULL, NULL, NULL, 'A*AA', 39, NULL, NULL, 75),
  ('BSc Architecture', '12.4%', 'No compulsory A-Level subjects but at least two from UCL''s preferred subject list required. AAB offer. Portfolio of creative work required upon invitation. GCSE English Language and Mathematics at grade C/4.', NULL, 6.5, 92, NULL, NULL, NULL, 'AAB', 36, NULL, NULL, 75),
  ('BSc Political Science', '~18%', 'No specific A-Level subjects required but essay-based subjects (History, Politics, English) highly valued. GCSE English Language and Mathematics at grade C/4. Personal statement must demonstrate engagement with political issues.', 5, 7.0, 100, NULL, NULL, NULL, 'AAA', 38, NULL, NULL, 75),
  ('MBBS Medicine', '~8%', 'A-Levels: A*AA. A-Level Chemistry required plus one from Biology/Human Biology, Mathematics, Further Mathematics, Physics. BMAT/UCAT required (check year-specific requirements). Work experience in healthcare strongly recommended. GCSE profile of mostly 7-9/A-A*. Multiple Mini Interview (MMI). October 15 UCAS deadline.', NULL, 7.5, 109, NULL, NULL, NULL, 'A*AA', 39, NULL, NULL, 75),
  ('BSc Psychology', '10.7%', 'No specific A-Level subjects required but science subjects (Biology, Psychology, Mathematics) valued. GCSE English Language and Mathematics at grade C/4. Personal statement must demonstrate genuine interest in psychology as a science.', 7, 7.0, 100, NULL, NULL, NULL, 'A*AA', 38, NULL, NULL, 75),
  ('BSc Mathematics', '~25%', 'A* in A-Level Mathematics required; A-Level Further Mathematics required. GCSE English Language at grade C/4. STEP or MAT may be used in offers. Resits not accepted.', NULL, 6.5, 92, NULL, NULL, NULL, 'A*A*A', 40, NULL, NULL, 75),
  ('BEng Mechanical Engineering', '~25%', 'A-Level Mathematics required (A* preferred); A-Level Physics or Further Mathematics required. GCSE English Language and Mathematics at grade C/4. Personal statement should demonstrate interest in engineering and problem-solving.', NULL, 6.5, 92, NULL, NULL, NULL, 'A*AA', 38, NULL, NULL, 75)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'UCL (University College London)';
