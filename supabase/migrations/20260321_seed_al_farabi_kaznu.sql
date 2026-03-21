-- Part 1: Update university-level data for Al-Farabi Kazakh National University
UPDATE public.universities SET
  website_url = 'https://farabi.university/?lang=en',
  tuition_usd = 4999,
  overall_acceptance_rate = '~60%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Rolling admissions; main intake September; applications typically open February–July for the following academic year',
  financial_aid = 'Kazakhstan government scholarships available under bilateral agreements for select nationalities. University merit-based scholarships for strong academic records. IELTS/TOEFL not mandatory for some programs; English proficiency assessed internally.'
WHERE name = 'Al-Farabi Kazakh National University';

-- Part 2: Insert top 10 majors for Al-Farabi Kazakh National University
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
  ('General Medicine (MBBS)', '~65%', 'Online application via welcome.kaznu.kz; certified copies of secondary education certificates; passport copy; medical certificate; NEET qualification required for Indian applicants; English proficiency assessed internally', 163, 6.0, 80, NULL::INTEGER, NULL::INTEGER, 3.0, 'BBB', 28, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Computer Science and Software Engineering', '~60%', 'Online application via welcome.kaznu.kz; certified secondary school transcripts; passport copy; mathematics background required; English proficiency certificate recommended', 290, 6.0, 79, NULL::INTEGER, NULL::INTEGER, 3.0, 'BCC', 27, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Information Technology', '~60%', 'Online application via welcome.kaznu.kz; secondary school transcripts; passport copy; strong mathematics and ICT background preferred; English proficiency certificate recommended', 290, 6.0, 79, NULL::INTEGER, NULL::INTEGER, 3.0, 'BCC', 27, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Economics and Business Administration', '~65%', 'Online application via welcome.kaznu.kz; certified secondary school transcripts; passport copy; mathematics background required; English proficiency certificate recommended', 308, 6.0, 79, NULL::INTEGER, NULL::INTEGER, 3.0, 'BCC', 27, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('International Relations', '~65%', 'Online application via welcome.kaznu.kz; certified secondary school transcripts; passport copy; strong humanities background preferred; English proficiency certificate recommended', 308, 6.0, 79, NULL::INTEGER, NULL::INTEGER, 3.0, 'BCC', 27, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Chemistry', '~60%', 'Online application via welcome.kaznu.kz; certified secondary school transcripts; passport copy; strong chemistry and mathematics background required; English proficiency certificate recommended', 401, 6.0, 79, NULL::INTEGER, NULL::INTEGER, 3.0, 'BCC', 27, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Biology', '~60%', 'Online application via welcome.kaznu.kz; certified secondary school transcripts; passport copy; strong biology and chemistry background required; English proficiency certificate recommended', 401, 6.0, 79, NULL::INTEGER, NULL::INTEGER, 3.0, 'BCC', 27, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Mathematics', '~58%', 'Online application via welcome.kaznu.kz; certified secondary school transcripts; passport copy; exceptional mathematics aptitude required; English proficiency certificate recommended', 401, 6.0, 79, NULL::INTEGER, NULL::INTEGER, 3.0, 'BCC', 27, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Journalism and Mass Communications', '~65%', 'Online application via welcome.kaznu.kz; certified secondary school transcripts; passport copy; writing sample may be requested; English proficiency certificate recommended', 183, 6.0, 79, NULL::INTEGER, NULL::INTEGER, 3.0, 'BCC', 27, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Law', '~62%', 'Online application via welcome.kaznu.kz; certified secondary school transcripts; passport copy; strong humanities background preferred; English proficiency certificate recommended', 308, 6.0, 79, NULL::INTEGER, NULL::INTEGER, 3.0, 'BCC', 27, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Al-Farabi Kazakh National University';
