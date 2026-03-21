-- Part 1: University-level data for University of Technology Sydney
UPDATE public.universities SET
  website_url = 'https://www.uts.edu.au/for-students/admissions-entry',
  tuition_usd = 32660,
  overall_acceptance_rate = '~19%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Autumn (Feb start): Nov 30 (offshore), Jan 15 (onshore); Spring (Jul start): Apr 30 (offshore), May 31 (onshore). Rolling admissions; apply early for student visa processing.',
  financial_aid = 'Need-aware. UTS IB & A-Level Scholarship: 50% tuition fees. Academic Excellence International Scholarship: 25% tuition. Academic Merit International Scholarship: 15% tuition (auto-considered). UTS College Pathway Scholarship: 30% tuition. Vice-Chancellor''s International UG Scholarship also available. No need-based aid for international students.'
WHERE name = 'University of Technology Sydney';

-- Part 2: Top 10 majors for University of Technology Sydney
INSERT INTO public.university_majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Nursing', 30, 'IELTS 7.0 overall (min 7.0 in each subtest) or TOEFL 94 (min 24 writing, 23 speaking/listening/reading) or PTE 65 (min 65 each subtest) required; clinical placements mandatory; Working with Children Check and National Police Check required; first aid and CPR certification; immunisation compliance', 'QS #26 World (2025)', 7.0, 94, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'BBB', 26, 70.0, NULL::INTEGER, 65),
  ('Computer Science (Honours)', 25, 'Strong mathematics background required; honours thesis in final year; UTS is ranked #1 in Australia for Computer Science and Engineering (ARWU 2025)', 'QS #62 World (2025)', 6.5, 79, NULL, NULL, NULL, 'BBC', 27, 82.0, NULL, 58),
  ('Engineering (Honours) - Civil', 30, 'Mathematics and physics background required; 4-year honours program; compulsory professional practice placement; Engineers Australia accredited', 'QS Top 150 World Engineering & Technology (2025)', 6.5, 79, NULL, NULL, NULL, 'BBC', 27, 82.0, NULL, 58),
  ('Business', 35, 'Majors include accounting, finance, marketing, management, economics, and digital creative enterprise; industry internship opportunities; UTS Business School AACSB accredited', 'QS Top 150 World Business & Management (2025)', 6.5, 79, NULL, NULL, NULL, 'BBC', 26, 85.0, NULL, 58),
  ('Information Technology', 30, 'Majors in business information systems, data analytics, enterprise systems, networking and cybersecurity, or interaction design; industry placement available', 'QS #62 World Computer Science & Information Systems (2025)', 6.5, 79, NULL, NULL, NULL, 'BBC', 26, 75.0, NULL, 58),
  ('Laws', 5, 'Combined degree required (e.g. B Business/B Laws or B Communication/B Laws); competitive entry; personal statement may be required; professional accreditation by Legal Profession Admission Board', 'THE #89 World Law (2026)', 6.5, 79, NULL, NULL, NULL, 'AAA', 33, 97.3, NULL, 58),
  ('Communication (Digital and Social Media)', 35, 'Portfolio or showreel may strengthen application; practical industry projects from first year; specialisations in journalism, media business, social and political sciences, or writing and publishing also available', 'QS Top 150 World Communication & Media Studies (2025)', 6.5, 79, NULL, NULL, NULL, 'BBC', 26, 71.0, NULL, 58),
  ('Design in Architecture', 20, 'Design portfolio required for admission; studio-based learning; 5-year pathway to professional architecture with Master of Architecture; accredited by Board of Architects of NSW', 'QS #51-100 World Architecture & Built Environment (2025)', 6.5, 79, NULL, NULL, NULL, 'BBB', 27, 87.0, NULL, 58),
  ('Data Science and Artificial Intelligence', 20, 'Strong mathematics and analytical skills required; covers machine learning, deep learning, NLP, and computer vision; UTS ranked #36 globally in Data Science and AI (QS 2025); industry capstone project required', 'QS #36 World Data Science and AI (2025)', 6.5, 79, NULL, NULL, NULL, 'BBC', 27, 82.0, NULL, 58),
  ('Biomedical Engineering (Honours)', 25, '4-year honours program; strong mathematics, physics, and biology background required; professional practice placement; covers medical devices, biomechanics, tissue engineering, and bioelectronics; Engineers Australia accredited', 'QS Top 150 World Engineering & Technology (2025)', 6.5, 79, NULL, NULL, NULL, 'BBC', 27, 84.0, NULL, 58)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'University of Technology Sydney';
