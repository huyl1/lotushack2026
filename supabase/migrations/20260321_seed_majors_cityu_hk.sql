-- Part 1: Update university-level data for City University of Hong Kong
UPDATE public.universities SET
  website_url = 'https://www.cityu.edu.hk/admo/admissions/international-admissions',
  tuition_usd = 21800,
  overall_acceptance_rate = '~36%',
  test_policy = 'Test-flexible',
  deadline_calendar = 'Early: Nov 15; Main: Jan 15; Rolling thereafter',
  financial_aid = 'Need-aware. Top Scholarship: ~USD 27,000/yr (full tuition + living allowance, renewable with CGPA >= 3.2). Full Tuition Scholarship: ~USD 21,800/yr. Half Tuition Scholarship: ~USD 10,900/yr. Diversity Grant: ~USD 3,850/yr for underrepresented nationalities. HKSAR Government Belt & Road scholarships available.'
WHERE name = 'City University of Hong Kong';

-- Part 2: Insert top 10 majors for City University of Hong Kong
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
  ('Computer Science', '~30%', 'College of Computing application; choose stream (AI / Cybersecurity / Data Science / Multimedia Computing / Software Engineering). Joint bachelor''s degree with Columbia University available.', 23, 6.5, 79, 1190, 24, 3.3, 'EEE', 30, 80.0, NULL::INTEGER, 62),
  ('Business Administration', '~35%', 'College of Business application; AACSB and EQUIS accredited. Flagship BBA Global Business programme available with overseas exchange requirement.', 22, 6.5, 79, 1190, 24, 3.2, 'EEE', 30, 80.0, NULL, 62),
  ('Electrical and Electronic Engineering', '~30%', 'College of Engineering application; strong mathematics and physics background required. Streams in communications, electronics, and power engineering.', 24, 6.5, 79, 1190, 24, 3.3, 'EEE', 30, 80.0, NULL, 62),
  ('Materials Science and Engineering', '~35%', 'College of Engineering application; strong chemistry and physics background required. CityU ranked #5 globally in Materials Science (US News).', 5, 6.5, 79, 1190, 24, 3.3, 'EEE', 30, 80.0, NULL, 62),
  ('Data Science', '~30%', 'College of Computing application; strong mathematics background required. Majors: BSc Data Science or BSc Data and Systems Engineering.', 19, 6.5, 79, 1190, 24, 3.3, 'EEE', 30, 80.0, NULL, 62),
  ('Mechanical Engineering', '~40%', 'College of Engineering application; strong mathematics and physics background required. Covers design, manufacturing, and energy systems.', 38, 6.5, 79, 1190, 24, 3.2, 'EEE', 30, 80.0, NULL, 62),
  ('Civil Engineering', '~40%', 'College of Engineering application; strong mathematics and physics background required. Covers structural, geotechnical, and environmental engineering.', 40, 6.5, 79, 1190, 24, 3.2, 'EEE', 30, 80.0, NULL, 62),
  ('Chemistry', '~35%', 'College of Science application; strong chemistry and mathematics background required. CityU ranked #23 globally in Chemistry (US News).', 23, 6.5, 79, 1190, 24, 3.3, 'EEE', 30, 80.0, NULL, 62),
  ('Communication and Media', '~35%', 'College of Liberal Arts and Social Sciences application; personal statement required. Strong writing and critical thinking skills expected.', 34, 6.5, 79, 1190, 24, 3.2, 'EEE', 30, 80.0, NULL, 62),
  ('Law', '~25%', 'School of Law application; personal statement and writing sample required. LLB programme; strong English proficiency essential. CityU Law ranked top 2 in Hong Kong.', 76, 6.5, 79, 1190, 24, 3.5, 'EEE', 30, 80.0, NULL, 62)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'City University of Hong Kong';
