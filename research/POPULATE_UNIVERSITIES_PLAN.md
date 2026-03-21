# Plan: Populate University + Majors Data

## Status
- **37/250 universities completed** (university-level only, as of session end)
- **0 majors populated** yet
- **~213 universities remaining**

## What to do

Run this prompt to continue populating:

```
Read research/POPULATE_UNIVERSITIES_PLAN.md and research/RESEARCH_FRAMEWORK.md, then execute the pipeline to populate all remaining universities and their top 10 majors.
```

## Pipeline

### Step 1: Get ALL universities that need work (missing uni data OR missing majors)
```sql
SELECT u.name, u.country, u.region, u.qs_rank,
  CASE WHEN u.website_url IS NULL THEN 'needs_both' ELSE 'needs_majors_only' END as status
FROM public.universities u
LEFT JOIN public.majors m ON m.university_id = u.id
GROUP BY u.id, u.name, u.country, u.region, u.qs_rank, u.website_url
HAVING u.website_url IS NULL OR COUNT(m.id) = 0
ORDER BY u.qs_rank;
```

This returns universities in two categories:
- `needs_both` — no university data AND no majors (the ~213 remaining)
- `needs_majors_only` — university data exists but no majors yet (the ~37 already done)

### Step 2: Launch background agents (5-10 at a time)

Each agent handles **one university completely** — both the 6 university-level fields AND inserting the top 10 majors with requirements.

Agent prompt template:

```
You are a university admissions data researcher. Research and populate ALL data for {{NAME}} ({{COUNTRY}}), then update the database.

## Part 1: University-level data
{{UNI_INSTRUCTIONS}}
```

Use one of these for `{{UNI_INSTRUCTIONS}}` based on status:

**If `needs_both`:**
```
1. Use `the Exa API via curl (see "Research Method" section below)` to search for: "{{NAME}}" international undergraduate admissions tuition acceptance rate 2025 deadlines financial aid
2. Extract 6 fields: website_url, tuition_usd (number), overall_acceptance_rate, test_policy ("Required"/"Test-optional"/"Test-blind"/"Test-flexible"/"Not applicable"), deadline_calendar, financial_aid
3. Use `mcp__supabase__execute_sql` to run:
UPDATE public.universities SET
  website_url = '...', tuition_usd = ..., overall_acceptance_rate = '...',
  test_policy = '...', deadline_calendar = '...', financial_aid = '...'
WHERE name = '{{NAME}}';
```

**If `needs_majors_only`:**
```
University data already exists. SKIP Part 1 — go directly to Part 2 (majors).
```

## Part 2: Top 10 majors
1. Use `the Exa API via curl (see "Research Method" section below)` to search for: "{{NAME}}" top undergraduate majors programs popular degrees requirements
2. Identify the top 10 most popular/notable undergraduate majors/programs
3. For each major, research admission requirements (IELTS, TOEFL, SAT, ACT, GPA, A-Levels, IB, ATAR, Duolingo, PTE minimums)
4. Use `mcp__supabase__execute_sql` to INSERT all 10 majors in one query:

```sql
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
  ('Major 1', 'rate', null, null, 6.5, 90, null, null, 3.7, null, null, null, null, null),
  ('Major 2', 'rate', null, null, 6.5, 90, null, null, 3.7, null, null, null, null, null)
  -- ... up to 10 majors
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking,
       ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades,
       ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = '{{NAME}}';
```

## Field notes for majors:
- Use numeric values only (e.g. ielts_min = 6.5, toefl_min = 90, sat_min = 1400)
- a_level_grades is text (e.g. 'AAA', 'A*AA')
- Use null for requirements that don't apply (e.g. sat_min = null for non-US schools)
- acceptance_rate is text (e.g. '12%') or null if not published per-major
- subject_ranking is the QS subject ranking if available, otherwise null
- supplemental_requirements for things like portfolios, auditions, interviews

{{REGION_GUIDANCE}}
Use actual data only. Escape single quotes as ''.
```

### Step 3: Region-specific guidance to include

**US schools:** test_policy is usually Required or Test-optional. ED/EA/RD deadlines. SAT/ACT minimums apply per major. GPA on 4.0 scale.

**UK schools:** test_policy = "Not applicable". UCAS deadlines (Jan 14 most, Oct 15 medicine/Oxbridge). A-Level grades are primary per-major requirement. IB points per major. No SAT/ACT. Convert GBP to USD.

**Australian/NZ schools:** test_policy = "Not applicable". ATAR is primary per-major requirement. A-Levels and IB accepted. No SAT/ACT. Convert AUD/NZD to USD.

**European (non-UK):** test_policy = "Not applicable". Many have very low or zero tuition. IB accepted. No SAT/ACT. Convert local currency to USD.

**Asian schools:** test_policy = "Not applicable" unless school explicitly accepts SAT/ACT (e.g. HK schools). IB/A-Levels accepted at many. Convert local currency to USD.

**Latin American/African schools:** test_policy = "Not applicable". Convert local currency to USD.

### Step 4: After all agents complete, verify
```sql
-- University completion
SELECT
  COUNT(*) FILTER (WHERE website_url IS NOT NULL) as uni_completed,
  COUNT(*) FILTER (WHERE website_url IS NULL) as uni_remaining,
  COUNT(*) as total
FROM public.universities;

-- Major completion
SELECT COUNT(DISTINCT m.university_id) as unis_with_majors,
  COUNT(*) as total_majors,
  ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT m.university_id), 0), 1) as avg_majors_per_uni
FROM public.majors m;

-- Universities missing majors
SELECT u.name, u.qs_rank FROM public.universities u
LEFT JOIN public.majors m ON m.university_id = u.id
GROUP BY u.id, u.name, u.qs_rank
HAVING COUNT(m.id) = 0
ORDER BY u.qs_rank;
```

### Step 5: Re-run for any failures
Query for remaining NULLs or missing majors and re-launch agents.

## Research Method: Exa API via curl

**Do NOT use Claude's internal knowledge or WebSearch.** All data must come from the Exa API.

Call the Exa search API directly via curl (not the MCP tool). Use the Bash tool:

```bash
curl -s -X POST 'https://api.exa.ai/search' \
  -H 'x-api-key: 5dc3b438-f9eb-4339-92ac-0bb93c9da388' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "{{UNIVERSITY_NAME}} international undergraduate admissions tuition acceptance rate 2025",
    "type": "auto",
    "numResults": 5,
    "contents": {
      "text": { "maxCharacters": 3000 }
    },
    "includeDomains": ["{{university_domain}}"]
  }'
```

For majors research:
```bash
curl -s -X POST 'https://api.exa.ai/search' \
  -H 'x-api-key: 5dc3b438-f9eb-4339-92ac-0bb93c9da388' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "{{UNIVERSITY_NAME}} top undergraduate programs majors admission requirements IELTS TOEFL",
    "type": "auto",
    "numResults": 5,
    "contents": {
      "text": { "maxCharacters": 5000 }
    }
  }'
```

You may need multiple searches per university (one for uni-level data, one or more for majors/requirements). Parse the JSON response and extract data from the `results[].text` fields.

## Settings Required
These tools must be in `.claude/settings.local.json` permissions allow list:
- `mcp__supabase__execute_sql`
- `mcp__supabase__apply_migration`

Already configured as of 2026-03-21.

## Key Files
- `research/RESEARCH_FRAMEWORK.md` — Field specs, SQL templates, majors schema
- `.claude/settings.local.json` — Tool permissions
- `.mcp.json` — Supabase MCP config
