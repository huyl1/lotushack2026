INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Commerce', 30.0, 'Standard university application; no supplemental requirements', 'QS #22 Accounting & Finance, #35 Business & Management', 7.0, 94, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'AAB', 33, 88.0, 110, 65),
  ('Computer Science', 25.0, 'Standard university application; assumed knowledge of Mathematics Advanced', 'QS #46 Computer Science & Information Systems', 6.5, 90, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB-AAB', 36, 92.0, 110, 64),
  ('Civil Engineering', 35.0, 'Standard university application; assumed knowledge of Mathematics Extension 1 and Physics', 'QS #24 Civil & Structural Engineering', 6.5, 90, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB-AAB', 36, 92.0, 110, 64),
  ('Law', 10.0, 'Law Admission Test (LAT) required; apply via UAC code 426000 as double degree only', 'QS #12 Law & Legal Studies', 7.0, 94, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'AAA + LAT', 42, 97.7, 120, 65),
  ('Medical Studies / Doctor of Medicine', 5.0, 'UCAT ANZ required; interview; apply via UAC; most in-demand program nationally with 1,607 first preferences', 'THE #64 Medical & Health', 7.0, 94, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'A*A*A + UCAT', 42, 97.0, 125, 65),
  ('Electrical Engineering', 35.0, 'Standard university application; assumed knowledge of Mathematics Extension 1 and Physics', 'QS #32 Electrical & Electronic Engineering', 6.5, 90, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB-AAB', 36, 92.0, 110, 64),
  ('Actuarial Studies', 15.0, 'Standard university application; assumed knowledge of Mathematics Extension 1', 'QS #22 Accounting & Finance (shared)', 7.0, 94, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'AAA', 38, 96.0, 110, 65),
  ('Mechanical Engineering', 35.0, 'Standard university application; assumed knowledge of Mathematics Extension 1 and Physics', 'QS #46 Mechanical, Aeronautical & Manufacturing Engineering', 6.5, 90, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB-AAB', 36, 92.0, 110, 64),
  ('Architecture', 20.0, 'Standard university application; no portfolio required for undergraduate entry', 'QS #23 Architecture / Built Environment', 6.5, 90, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 33, 88.0, 110, 64),
  ('Economics', 40.0, 'Standard university application; assumed knowledge of Mathematics Advanced', 'QS #40 Economics & Econometrics', 7.0, 94, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'AAB', 32, 86.0, 110, 65)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'The University of New South Wales';
