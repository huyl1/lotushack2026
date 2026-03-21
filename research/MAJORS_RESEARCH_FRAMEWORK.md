# Majors Research Framework

Agent-ready guide for populating the top 10 undergraduate majors per university. An agent should be able to take one university and return all 10 majors in a single pass.

## Agent Prompt Template

Use this prompt to research a single university. Replace `{{UNIVERSITY_NAME}}` and `{{COUNTRY}}`.

```
Research the top 10 most popular or flagship undergraduate majors/programs at {{UNIVERSITY_NAME}} ({{COUNTRY}}) for international students. Return ONLY a JSON array of 10 objects with these exact keys. Use null if data is genuinely unavailable.

[
  {
    "major_name": "Computer Science",
    "degree_type": "BS | BA | BEng | BSc | BCom | Other",
    "department": "School of Engineering",
    "duration_years": 4,
    "tuition_usd_override": null,
    "description": "1-2 sentence summary of the program and what makes it distinctive at this university",
    "career_outcomes": "Software Engineer, Data Scientist, Product Manager",
    "median_starting_salary_usd": 95000,
    "application_requirements": "Supplemental essay, portfolio, interview, etc.",
    "popularity_rank": 1
  }
]

Selection criteria (in priority order):
1. Programs the university is best known for (flagship/signature programs)
2. Programs with the highest international student enrollment
3. Programs ranked highly in global subject rankings (QS, THE)
4. Overall most popular programs by enrollment

Always include at least one STEM, one business/economics, and one humanities/social science program if the university offers them.
```

## Field Specifications

### major_name
- Official program/major name as listed by the university
- Use the English name; include the local name in parentheses only if commonly referenced (e.g., "Philosophy, Politics and Economics (PPE)")
- Do not include degree type in the name (e.g., "Computer Science" not "BS in Computer Science")

### degree_type
- The degree conferred upon completion
- Must be one of: `"BS"`, `"BA"`, `"BEng"`, `"BSc"`, `"BCom"`, `"BBA"`, `"LLB"`, `"BArch"`, `"BFA"`, `"BMus"`, `"Other"`
- Use the degree type as awarded by that specific university (e.g., UK schools award `"BSc"` / `"BA"`, US schools award `"BS"` / `"BA"`)

### department
- The school, faculty, or college that houses the program
- Use the official name (e.g., "Faculty of Engineering", "Wharton School", "College of Arts and Sciences")

### duration_years
- Standard program length in years (numeric)
- Use the international student duration if it differs from domestic
- UK/Australia undergrad is typically 3; US is typically 4; engineering/architecture may be 5

### tuition_usd_override
- Program-specific annual tuition in USD if it differs from the university-level tuition
- `null` if the program uses the standard university tuition rate
- Common overrides: business schools, engineering, medicine, fine arts

### description
- 1-2 sentence summary of what makes this program distinctive at this university
- Highlight unique features: co-op programs, research opportunities, special facilities, notable faculty areas
- Do not use generic descriptions that could apply to any university

### career_outcomes
- Comma-separated list of 3-5 common career paths for graduates
- Be specific where possible (e.g., "Investment Banking Analyst" not just "Finance")
- Based on the university's own published outcomes data if available

### median_starting_salary_usd
- Median starting salary for graduates of this specific program, in USD
- Convert non-USD using current exchange rates
- Use university-published data or reputable salary surveys
- `null` if not available — do not fabricate

### application_requirements
- Any program-specific admission requirements beyond the university's general application
- Examples: supplemental essays, portfolios, auditions, interviews, prerequisite courses, separate application
- `"Standard university application"` if no additional requirements

### popularity_rank
- Rank 1-10 indicating relative popularity/prominence among the 10 selected programs
- 1 = most popular/flagship program
- This is a relative ranking within the 10 returned, not a global ranking

## Region-Specific Guidance

**US:** Students often declare majors after admission. List the most popular declared majors. Degree types are typically BS/BA. Duration is 4 years. Many programs have no additional application requirements.

**UK:** Students apply directly to a specific course/program. Programs are typically 3 years (4 with placement year). Degree types are BSc/BA/BEng/LLB. UCAS-based admission — specific A-Level/IB subjects may be required per program.

**Australia/NZ:** Similar to UK — apply to specific programs. Typically 3 years (4 for honours). Degree types follow UK conventions. Some programs require prerequisite subjects in Year 12.

**Continental Europe:** Many programs taught in the local language — prioritize English-taught programs for international students. Duration is typically 3 years (Bologna system). Tuition is often uniform across programs.

**Asia:** Varies widely. Singapore/HK follow UK conventions. Chinese/Japanese/Korean universities may have separate international programs. Prioritize English-taught programs where available.

## SQL: Create Majors Table

```sql
CREATE TABLE public.majors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  major_name TEXT NOT NULL,
  degree_type TEXT NOT NULL,
  department TEXT,
  duration_years INTEGER,
  tuition_usd_override INTEGER,
  description TEXT,
  career_outcomes TEXT,
  median_starting_salary_usd INTEGER,
  application_requirements TEXT,
  popularity_rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(university_id, major_name)
);

-- Only authenticated users (no anonymous access)
REVOKE ALL ON public.majors FROM anon;
```

## SQL: Insert Majors for a University

```sql
INSERT INTO public.majors (university_id, major_name, degree_type, department, duration_years, tuition_usd_override, description, career_outcomes, median_starting_salary_usd, application_requirements, popularity_rank)
VALUES (
  (SELECT id FROM public.universities WHERE name = '{{UNIVERSITY_NAME}}'),
  '{{major_name}}',
  '{{degree_type}}',
  '{{department}}',
  {{duration_years}},
  {{tuition_usd_override}},
  '{{description}}',
  '{{career_outcomes}}',
  {{median_starting_salary_usd}},
  '{{application_requirements}}',
  {{popularity_rank}}
);
```

## SQL: Find Universities Missing Majors Data

```sql
SELECT u.name, u.country, u.qs_rank
FROM public.universities u
LEFT JOIN public.majors m ON m.university_id = u.id
WHERE m.id IS NULL
ORDER BY u.qs_rank::int;
```
