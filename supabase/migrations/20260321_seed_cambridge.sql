-- Part 1: University-level data for University of Cambridge
-- Sources: Official Cambridge tuition fees 2025-26 PDF, UniAdmissions acceptance rate data (2025 cycle),
-- Cambridge Trust and official scholarships page, UCAS deadlines
-- International tuition: GBP 27,024-41,124 (university fee) + GBP 11,000-13,662 (college fee)
-- Average across all courses ~GBP 33,000 tuition + ~GBP 12,500 college fee = ~GBP 45,500 => USD 57,330
-- Acceptance rate: 2025 cycle offer rate 21.7%, acceptance rate 16.3% (UniAdmissions 2026 update)

UPDATE public.universities SET
  website_url = 'https://www.cam.ac.uk',
  tuition_usd = 57330,
  overall_acceptance_rate = '21.7% offer rate; 16.3% acceptance rate (2025 cycle). International acceptance rate ~10.9%.',
  test_policy = 'Not applicable',
  deadline_calendar = 'UCAS deadline: October 15 (18:00 UK time) for all undergraduate courses. Applications open September 1. Admissions tests (ESAT, TMUA, UCAT, LNAT) required for specific courses with separate registration deadlines. Interviews held December 1-19 (online or in-person depending on college). STEP exams May-June for Mathematics offers. A-Level/IB results confirmed August. Deferred entry accepted.',
  financial_aid = 'Cambridge Bursary Scheme: up to GBP 3,500/year (non-repayable, means-tested, UK Home students only). Cambridge Trust: undergraduate scholarships for international students (partial contributions, means-tested, awarded via college nomination after offer of admission). College-specific awards, grants, and bursaries vary by college. Gates Cambridge Scholarships: ~80 full-cost awards per year for postgraduate study only. Few full undergraduate scholarships available for international students; most support is partial. Care leavers may receive up to GBP 8,350/year.'
WHERE name = 'University of Cambridge';

-- Part 2: Top 10 majors for University of Cambridge
DELETE FROM public.majors WHERE university_id = (SELECT id FROM public.universities WHERE name = 'University of Cambridge');

-- Insert top 10 majors by application volume (2024 admissions cycle data from official Cambridge statistics)
-- Acceptance rates from savemyexams.com Cambridge admissions statistics (2024 cycle offer rates)
-- A-Level typical offers from official Cambridge course pages
-- IB typical offer: 40-42 points with 776 at Higher Level
-- IELTS: 7.5 overall (no element below 7.0) for all courses
-- TOEFL: 110 (no element below 25)
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Engineering', '14.0%', 'ESAT (Engineering and Science Admissions Test) required; two sciences and Mathematics at A-Level required; Physics and Mathematics subtests mandatory for ESAT; 2,654 applications in 2024 cycle with 371 offers', 3, 7.5, 110, NULL::int, NULL::int, NULL::numeric, 'A*A*A', 42, NULL::numeric, NULL::int, NULL::int),
  ('Natural Sciences', '25.7%', 'ESAT (Engineering and Science Admissions Test) required; at least two science/maths A-Levels required; specific science requirements vary by college; 2,529 applications in 2024 cycle with 650 offers', 3, 7.5, 110, NULL, NULL, NULL, 'A*A*A', 41, NULL, NULL, NULL),
  ('Computer Science', '9.0%', 'TMUA (Test of Mathematics for University Admissions) required; Mathematics and Further Mathematics at A-Level strongly recommended; most competitive Cambridge course with only 168 offers from 1,863 applications in 2024', 9, 7.5, 110, NULL, NULL, NULL, 'A*A*A', 42, NULL, NULL, NULL),
  ('Mathematics', '29.2%', 'STEP (Sixth Term Examination Paper) required as part of conditional offer, typically Grade 1 in STEP II and III; TMUA required for initial assessment; Mathematics and Further Mathematics at A-Level required; 1,840 applications in 2024 with 537 offers', 4, 7.5, 110, NULL, NULL, NULL, 'A*A*A', 42, NULL, NULL, NULL),
  ('Medicine', '16.1%', 'UCAT (University Clinical Aptitude Test) required; Chemistry and one of Biology/Physics/Mathematics at A-Level required; work experience in healthcare settings expected; 6-year course; international tuition GBP 70,554/year; 1,791 applications in 2024 with 288 offers', 5, 7.5, 110, NULL, NULL, NULL, 'A*A*A', 42, NULL, NULL, NULL),
  ('Law', '18.0%', 'LNAT (Law National Aptitude Test) required; no specific A-Level subjects mandated but essay-based subjects valued; strong LNAT essay performance important; 1,604 applications in 2024 with 288 offers', 3, 7.5, 110, NULL, NULL, NULL, 'A*AA', 41, NULL, NULL, NULL),
  ('Economics', '12.5%', 'TMUA (Test of Mathematics for University Admissions) required; Mathematics at A-Level required with A* grade; 1,571 applications in 2024 with only 197 offers; highly competitive', 10, 7.5, 110, NULL, NULL, NULL, 'A*A*A', 42, NULL, NULL, NULL),
  ('Human, Social, and Political Sciences', '18.1%', 'No admissions test required; broad range of A-Level subjects accepted; submitted written work at interview may be required; covers politics, international relations, sociology, and social anthropology; 1,259 applications in 2024 with 228 offers', 7, 7.5, 110, NULL, NULL, NULL, 'A*AA', 41, NULL, NULL, NULL),
  ('Psychological and Behavioural Sciences', '12.9%', 'ESAT (Engineering and Science Admissions Test) required; one science A-Level required; strong background in biological or social sciences preferred; 837 applications in 2024 with 108 offers', 4, 7.5, 110, NULL, NULL, NULL, 'A*A*A', 41, NULL, NULL, NULL),
  ('Architecture', '16.7%', 'No admissions test required; portfolio of creative work required at interview; Art or Design at A-Level not required but can be helpful; strong interest in design and built environment; 526 applications in 2024 with 88 offers; 3-year BA followed by optional professional qualification', 7, 7.5, 110, NULL, NULL, NULL, 'A*AA', 41, NULL, NULL, NULL)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'University of Cambridge';
