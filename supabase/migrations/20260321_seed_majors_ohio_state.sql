-- Delete existing majors for Ohio State University
DELETE FROM public.majors WHERE university_id = '9bf13a73-a690-462c-a22d-cb335225706e';

-- Insert top 10 majors for Ohio State University (Columbus)
-- Source: OSU EARI Top 10 Undergraduate Majors (Autumn 2024), CDS 2024-2025
-- SAT 25th-75th: 1280-1430 | ACT 25th-75th: 26-32 | IELTS min: 6.5 | TOEFL min: 79
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
VALUES
  ('9bf13a73-a690-462c-a22d-cb335225706e', 'Finance', '60%', 'Fisher College of Business; admitted directly into major and specialization. Common App required; $60 application fee; Early Action Nov 1 / Regular Jan 15.', NULL, 6.5, 79, 1280, 26, 3.84, NULL, NULL, NULL, 120, NULL),
  ('9bf13a73-a690-462c-a22d-cb335225706e', 'Biology', '60%', 'College of Arts and Sciences; admitted directly into major. Common App required; $60 application fee; Early Action Nov 1 / Regular Jan 15.', NULL, 6.5, 79, 1280, 26, 3.84, NULL, NULL, NULL, 120, NULL),
  ('9bf13a73-a690-462c-a22d-cb335225706e', 'Psychology', '60%', 'College of Arts and Sciences; admitted directly into major. Common App required; $60 application fee; Early Action Nov 1 / Regular Jan 15.', NULL, 6.5, 79, 1280, 26, 3.84, NULL, NULL, NULL, 120, NULL),
  ('9bf13a73-a690-462c-a22d-cb335225706e', 'Marketing', '60%', 'Fisher College of Business; admitted directly into major and specialization. Common App required; $60 application fee; Early Action Nov 1 / Regular Jan 15.', NULL, 6.5, 79, 1280, 26, 3.84, NULL, NULL, NULL, 120, NULL),
  ('9bf13a73-a690-462c-a22d-cb335225706e', 'Computer Science and Engineering', '60%', 'College of Engineering; admitted as pre-major (admission to major is competitive). Common App required; $60 application fee; Early Action Nov 1 / Regular Jan 15.', NULL, 6.5, 79, 1330, 29, 3.84, NULL, NULL, NULL, 120, NULL),
  ('9bf13a73-a690-462c-a22d-cb335225706e', 'Mechanical Engineering', '60%', 'College of Engineering; admitted directly into major. Common App required; $60 application fee; Early Action Nov 1 / Regular Jan 15.', NULL, 6.5, 79, 1280, 26, 3.84, NULL, NULL, NULL, 120, NULL),
  ('9bf13a73-a690-462c-a22d-cb335225706e', 'Electrical and Computer Engineering', '60%', 'College of Engineering; admitted directly into major. Common App required; $60 application fee; Early Action Nov 1 / Regular Jan 15.', NULL, 6.5, 79, 1280, 26, 3.84, NULL, NULL, NULL, 120, NULL),
  ('9bf13a73-a690-462c-a22d-cb335225706e', 'Accounting', '60%', 'Fisher College of Business; admitted directly into major and specialization. Common App required; $60 application fee; Early Action Nov 1 / Regular Jan 15.', NULL, 6.5, 79, 1280, 26, 3.84, NULL, NULL, NULL, 120, NULL),
  ('9bf13a73-a690-462c-a22d-cb335225706e', 'Communication', '60%', 'College of Arts and Sciences; admitted directly into major. Common App required; $60 application fee; Early Action Nov 1 / Regular Jan 15.', NULL, 6.5, 79, 1280, 26, 3.84, NULL, NULL, NULL, 120, NULL),
  ('9bf13a73-a690-462c-a22d-cb335225706e', 'Health Sciences', '60%', 'College of Health and Rehabilitation Sciences; admitted as pre-major. Common App required; $60 application fee; Early Action Nov 1 / Regular Jan 15.', NULL, 6.5, 79, 1280, 26, 3.84, NULL, NULL, NULL, 120, NULL);
