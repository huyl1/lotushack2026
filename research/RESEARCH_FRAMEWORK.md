# University & Major Research Framework

Agent-ready guide for populating admissions data. There are two levels of research:
1. **University-level** — 6 school-wide fields (one agent per university)
2. **Major-level** — per-program requirements and rankings (one agent per major)

---

## Part 1: University Research

An agent takes one university and fills 6 school-wide fields.

### Agent Prompt Template

```
Research the following school-wide admissions data for {{UNIVERSITY_NAME}} ({{COUNTRY}}) for international undergraduate students. Return ONLY a JSON object with these exact keys. Use null if genuinely unavailable.

{
  "website_url": "Main international/undergraduate admissions page URL",
  "tuition_usd": 00000,
  "overall_acceptance_rate": "X%",
  "test_policy": "Required | Test-optional | Test-blind | Test-flexible | Not applicable",
  "deadline_calendar": "ED: Mon DD; EA: Mon DD; RD: Mon DD",
  "financial_aid": "Need-blind/aware for intl. Merit scholarships: $Xk-$Xk/yr. Avg intl aid: $Xk"
}
```

### Field Specifications

#### website_url
- The university's international/undergraduate admissions page
- Must be a valid, direct URL — not a search results page
- Prefer the international admissions page if separate from domestic

#### tuition_usd
- Annual tuition for international undergrads, in USD (numeric, no symbols)
- Convert non-USD using current exchange rates
- If tuition varies by program, use the most common/general rate
- Exclude room & board — tuition and fees only

#### overall_acceptance_rate
- Overall undergraduate acceptance rate as text
- Format: `"7%"`, `"~30%"`, `"15-20%"`
- Use most recent available year
- `null` if the university does not publish this

#### test_policy
- SAT/ACT requirement policy for admission
- Must be one of: `"Required"`, `"Test-optional"`, `"Test-blind"`, `"Test-flexible"`, `"Not applicable"`
- `"Not applicable"` for universities that don't consider SAT/ACT at all

#### deadline_calendar
- Key application deadlines with round labels
- Format: `"ED: Nov 1; EA: Nov 15; RD: Jan 1"` or `"Main: Jan 15; Late: Mar 1"`
- For rolling admissions: `"Rolling (recommended by Mon DD)"`

#### financial_aid
- International student financial aid summary
- Include: need-blind vs need-aware policy, merit scholarship availability, average aid amount if published
- `null` if no aid available for international students

### SQL: Update a University

```sql
UPDATE public.universities
SET
  website_url = '{{website_url}}',
  tuition_usd = {{tuition_usd}},
  overall_acceptance_rate = '{{overall_acceptance_rate}}',
  test_policy = '{{test_policy}}',
  deadline_calendar = '{{deadline_calendar}}',
  financial_aid = '{{financial_aid}}'
WHERE name = '{{UNIVERSITY_NAME}}';
```

### SQL: Find Universities Missing Data

```sql
SELECT name, country, qs_rank FROM public.universities
WHERE website_url IS NULL
ORDER BY qs_rank;
```

---

## Part 2: Major Research

An agent takes one major at one university and fills program-specific fields.

### Majors Table Schema

| Column | Type | Description | Example |
|---|---|---|---|
| `major_name` | text | Program name | "Computer Science" |
| `acceptance_rate` | text | Program-specific acceptance rate | "12%" |
| `supplemental_requirements` | text | Extra requirements (portfolio, audition, etc.) | "Portfolio required" |
| `subject_ranking` | integer | QS or national subject ranking | 5 |
| `ielts_min` | numeric(2,1) | Minimum IELTS Academic overall score | 6.5 |
| `toefl_min` | integer | Minimum TOEFL iBT score | 90 |
| `sat_min` | integer | Minimum or 25th percentile SAT score | 1400 |
| `act_min` | integer | Minimum or 25th percentile ACT score | 32 |
| `gpa_min` | numeric(3,2) | Minimum GPA on 4.0 scale | 3.70 |
| `a_level_grades` | text | Typical A-Level offer | "A*AA" |
| `ib_min` | integer | Minimum IB Diploma points | 38 |
| `atar_min` | numeric(4,1) | Minimum ATAR score | 95.0 |
| `duolingo_min` | integer | Minimum Duolingo English Test score | 120 |
| `pte_min` | integer | Minimum PTE Academic score | 65 |

### Agent Prompt Template

```
Research the admission requirements for {{MAJOR_NAME}} at {{UNIVERSITY_NAME}} ({{COUNTRY}}) for international undergraduate students. Return ONLY a JSON object. Use null for fields that don't apply or aren't published.

{
  "major_name": "Computer Science",
  "acceptance_rate": "12%",
  "supplemental_requirements": null,
  "subject_ranking": 5,
  "ielts_min": 6.5,
  "toefl_min": 90,
  "sat_min": 1400,
  "act_min": 32,
  "gpa_min": 3.70,
  "a_level_grades": "A*AA",
  "ib_min": 38,
  "atar_min": null,
  "duolingo_min": 120,
  "pte_min": 65
}
```

### Field Notes

- **ielts_min**: Overall band score. Sub-score requirements go in `supplemental_requirements`.
- **sat_min / act_min**: Use the 25th percentile of admitted students, or the minimum if published. `null` for schools that don't consider SAT/ACT.
- **gpa_min**: Always on 4.0 scale. Convert from other scales if needed. `null` if not applicable.
- **a_level_grades**: Text format for grade offers (e.g. "AAA", "A*A*A"). `null` if A-Levels not accepted.
- **ib_min**: Total IB Diploma points. HL subject requirements go in `supplemental_requirements`.
- **atar_min**: Primarily for Australian universities. `null` for others.
- **duolingo_min / pte_min**: `null` if not accepted.

### SQL: Insert a Major

```sql
INSERT INTO public.majors (
  university_id, major_name, acceptance_rate, supplemental_requirements,
  subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min,
  a_level_grades, ib_min, atar_min, duolingo_min, pte_min
) VALUES (
  (SELECT id FROM public.universities WHERE name = '{{UNIVERSITY_NAME}}'),
  '{{major_name}}', '{{acceptance_rate}}', '{{supplemental_requirements}}',
  {{subject_ranking}}, {{ielts_min}}, {{toefl_min}}, {{sat_min}}, {{act_min}},
  {{gpa_min}}, '{{a_level_grades}}', {{ib_min}}, {{atar_min}},
  {{duolingo_min}}, {{pte_min}}
);
```

### SQL: Find Majors Missing Data

```sql
SELECT u.name as university, m.major_name, m.ielts_min, m.sat_min
FROM public.majors m
JOIN public.universities u ON u.id = m.university_id
WHERE m.ielts_min IS NULL AND m.toefl_min IS NULL
ORDER BY u.qs_rank;
```

---

## Region-Specific Guidance

**US:** SAT/ACT often required or test-optional. GPA on 4.0 scale. ED/EA/RD deadlines. Most accept IB. A-Levels accepted at many top schools. No ATAR.

**UK:** SAT/ACT not applicable. A-Level grades are primary requirement. IB accepted everywhere. UCAS deadlines. Convert GBP to USD.

**Australia/NZ:** SAT/ACT not applicable. ATAR is primary for Australian schools. A-Levels and IB widely accepted. Convert AUD to USD.

**Continental Europe:** Often free/low tuition. SAT/ACT not applicable. IB widely accepted. A-Levels accepted at many schools. No ATAR.

**Asia/Middle East:** National exam systems. SAT/ACT sometimes accepted (HK, Singapore). IB accepted at most international-facing universities. A-Levels accepted in HK, Singapore, Malaysia. Convert local currencies to USD.
