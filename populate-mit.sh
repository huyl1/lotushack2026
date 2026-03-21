#!/bin/bash

# Step 1: PATCH university record
echo "=== Updating MIT university record ==="
curl -s -X PATCH 'https://erfubjzeantptcuetwti.supabase.co/rest/v1/universities?name=eq.Massachusetts%20Institute%20of%20Technology%20(MIT)' \
  -H "Authorization: Bearer sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU" \
  -H "apikey: sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"website_url":"https://mitadmissions.org/apply/firstyear/","tuition_usd":61990,"overall_acceptance_rate":"4.7%","test_policy":"Required","deadline_calendar":"EA: Nov 1; RD: Jan 1","financial_aid":"Need-blind, need-based, full-need for all students including international. Meets 100% of demonstrated financial need. Families with income under $100K expected to contribute $0; income under $200K attend tuition-free. Median MIT Scholarship: $66,663. Apply via CSS Profile and IDOC."}'
echo ""
echo "PATCH done."

# Step 2: DELETE existing majors
echo "=== Deleting existing MIT majors ==="
curl -s -X DELETE 'https://erfubjzeantptcuetwti.supabase.co/rest/v1/majors?university_id=eq.5628061b-fe40-4966-99f9-a399f4f61029' \
  -H "Authorization: Bearer sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU" \
  -H "apikey: sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU"
echo ""
echo "DELETE done."

# Step 3: INSERT 10 majors
echo "=== Inserting 10 MIT majors ==="
curl -s -X POST 'https://erfubjzeantptcuetwti.supabase.co/rest/v1/majors' \
  -H "Authorization: Bearer sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU" \
  -H "apikey: sb_secret_j7WQ-rGumcaQgprgGhl5bA_oQQin7SU" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '[
    {"university_id":"5628061b-fe40-4966-99f9-a399f4f61029","major_name":"Computer Science and Engineering","acceptance_rate":null,"supplemental_requirements":null,"subject_ranking":1,"ielts_min":7.0,"toefl_min":90,"sat_min":1550,"act_min":35,"gpa_min":3.9,"a_level_grades":"A*A*A*","ib_min":42,"atar_min":null,"duolingo_min":120,"pte_min":65},
    {"university_id":"5628061b-fe40-4966-99f9-a399f4f61029","major_name":"Electrical Engineering and Computer Science","acceptance_rate":null,"supplemental_requirements":null,"subject_ranking":1,"ielts_min":7.0,"toefl_min":90,"sat_min":1550,"act_min":35,"gpa_min":3.9,"a_level_grades":"A*A*A*","ib_min":42,"atar_min":null,"duolingo_min":120,"pte_min":65},
    {"university_id":"5628061b-fe40-4966-99f9-a399f4f61029","major_name":"Mathematics","acceptance_rate":null,"supplemental_requirements":null,"subject_ranking":1,"ielts_min":7.0,"toefl_min":90,"sat_min":1550,"act_min":35,"gpa_min":3.9,"a_level_grades":"A*A*A*","ib_min":42,"atar_min":null,"duolingo_min":120,"pte_min":65},
    {"university_id":"5628061b-fe40-4966-99f9-a399f4f61029","major_name":"Physics","acceptance_rate":null,"supplemental_requirements":null,"subject_ranking":1,"ielts_min":7.0,"toefl_min":90,"sat_min":1540,"act_min":35,"gpa_min":3.9,"a_level_grades":"A*A*A*","ib_min":42,"atar_min":null,"duolingo_min":120,"pte_min":65},
    {"university_id":"5628061b-fe40-4966-99f9-a399f4f61029","major_name":"Mechanical Engineering","acceptance_rate":null,"supplemental_requirements":null,"subject_ranking":1,"ielts_min":7.0,"toefl_min":90,"sat_min":1540,"act_min":35,"gpa_min":3.9,"a_level_grades":"A*A*A*","ib_min":42,"atar_min":null,"duolingo_min":120,"pte_min":65},
    {"university_id":"5628061b-fe40-4966-99f9-a399f4f61029","major_name":"Chemical Engineering","acceptance_rate":null,"supplemental_requirements":null,"subject_ranking":1,"ielts_min":7.0,"toefl_min":90,"sat_min":1540,"act_min":35,"gpa_min":3.9,"a_level_grades":"A*A*A*","ib_min":42,"atar_min":null,"duolingo_min":120,"pte_min":65},
    {"university_id":"5628061b-fe40-4966-99f9-a399f4f61029","major_name":"Artificial Intelligence and Decision Making","acceptance_rate":null,"supplemental_requirements":null,"subject_ranking":1,"ielts_min":7.0,"toefl_min":90,"sat_min":1550,"act_min":35,"gpa_min":3.9,"a_level_grades":"A*A*A*","ib_min":42,"atar_min":null,"duolingo_min":120,"pte_min":65},
    {"university_id":"5628061b-fe40-4966-99f9-a399f4f61029","major_name":"Biological Engineering","acceptance_rate":null,"supplemental_requirements":null,"subject_ranking":2,"ielts_min":7.0,"toefl_min":90,"sat_min":1530,"act_min":35,"gpa_min":3.9,"a_level_grades":"A*A*A*","ib_min":42,"atar_min":null,"duolingo_min":120,"pte_min":65},
    {"university_id":"5628061b-fe40-4966-99f9-a399f4f61029","major_name":"Finance","acceptance_rate":null,"supplemental_requirements":null,"subject_ranking":2,"ielts_min":7.0,"toefl_min":90,"sat_min":1530,"act_min":34,"gpa_min":3.9,"a_level_grades":"A*A*A","ib_min":42,"atar_min":null,"duolingo_min":120,"pte_min":65},
    {"university_id":"5628061b-fe40-4966-99f9-a399f4f61029","major_name":"Architecture","acceptance_rate":null,"supplemental_requirements":"Portfolio required","subject_ranking":2,"ielts_min":7.0,"toefl_min":90,"sat_min":1520,"act_min":34,"gpa_min":3.9,"a_level_grades":"A*AA","ib_min":41,"atar_min":null,"duolingo_min":120,"pte_min":65}
  ]'
echo ""
echo "INSERT done."
echo "=== All operations complete ==="
