#!/usr/bin/env python3
"""
Embed student_states from Supabase (joined with students) using the voyage-3
embedding pipeline, then write embeddings back to student_states.

Usage
-----
    cd python
    source .venv/bin/activate
    python scripts/embed_students.py

    # Dry-run: just print the first 3 concatenated texts without calling API
    python scripts/embed_students.py --dry-run --limit 3

Environment
-----------
    VOYAGE_API_KEY  — your Voyage AI key
    SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY
    (falls back to python/.env)
"""

from __future__ import annotations

import argparse
from datetime import date, datetime
import logging
import os
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=False)
load_dotenv(Path(__file__).resolve().parents[2] / ".env.development.local", override=False)

from embeddings.pipeline import EmbeddingConfig, EmbeddingPipeline, FieldConfig

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

STUDENT_FIELDS: list[FieldConfig] = [
    FieldConfig("left_overtime",                     weight=4.0, label="Months Until First Fall Semester"),
    FieldConfig("name",                              weight=4.0, label="Student Name"),
    FieldConfig("grade",                             weight=3.0, label="Grade Level"),
    FieldConfig("sat_score",                         weight=3.0, label="SAT Score"),
    FieldConfig("act_score",                         weight=3.0, label="ACT Score"),
    FieldConfig("ielts_score",                       weight=2.5, label="IELTS Score"),
    FieldConfig("gpa",                               weight=3.5, label="GPA"),
    FieldConfig("target_majors",                    weight=3.0, label="Target Majors"),
    FieldConfig("preferred_countries",               weight=2.5, label="Preferred Countries"),
    FieldConfig("preferred_setting",                weight=1.5, label="Preferred Campus Setting"),
    FieldConfig("preferred_size",                   weight=1.0, label="Preferred Campus Size"),
    FieldConfig("budget_usd",                        weight=2.5, label="Budget (USD)"),
    FieldConfig("needs_financial_aid",               weight=2.5, label="Needs Financial Aid"),
    FieldConfig("target_acceptance_rate_min",        weight=2.0, label="Minimum Acceptance Rate Desired"),
    FieldConfig("application_round",                 weight=1.5, label="Application Round"),
]


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    raw = value.strip()
    if not raw:
        return None
    normalized = raw.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(normalized).date()
    except ValueError:
        try:
            return date.fromisoformat(raw)
        except ValueError:
            return None


def _parse_grade(value: str | int | None) -> int | None:
    if value is None:
        return None
    if isinstance(value, int):
        return value if value in (9, 10, 11, 12) else None

    raw = str(value).strip().lower()
    numeric = {"9": 9, "10": 10, "11": 11, "12": 12}
    if raw in numeric:
        return numeric[raw]

    aliases = {
        "freshman": 9,
        "9th": 9,
        "grade 9": 9,
        "sophomore": 10,
        "10th": 10,
        "grade 10": 10,
        "junior": 11,
        "11th": 11,
        "grade 11": 11,
        "senior": 12,
        "12th": 12,
        "grade 12": 12,
    }
    return aliases.get(raw)


def _months_until_august(reference_date: date, years_from_now: int) -> int:
    target_year = reference_date.year + years_from_now
    month_diff = (target_year - reference_date.year) * 12 + (8 - reference_date.month)
    return max(month_diff, 0)


def compute_left_overtime(grade: str | int | None, signup_date: date | None = None) -> int | None:
    grade_num = _parse_grade(grade)
    if grade_num is None:
        return None

    ref = signup_date or date.today()
    years_to_first_fall = (12 - grade_num) + (1 if ref.month >= 9 else 0)
    return _months_until_august(ref, years_to_first_fall)


def enrich_row_with_left_overtime(row: dict) -> dict:
    enriched = dict(row)
    grade = row.get("grade", row.get("student_grade"))
    signup = _parse_date(row.get("created_at"))
    left_overtime = compute_left_overtime(grade, signup)
    if left_overtime is not None:
        enriched["left_overtime"] = left_overtime
    return enriched


def _supabase_client() -> Client:
    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        logger.error("SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
        sys.exit(1)
    return create_client(supabase_url, supabase_key)


def load_rows_from_supabase(supabase: Client, limit: int | None = None) -> list[dict[str, Any]]:
    query = supabase.table("student_states").select(
        "id,student_id,sat_score,ielts_score,created_at,gpa,act_score,target_majors,"
        "preferred_countries,preferred_setting,preferred_size,budget_usd,needs_financial_aid,"
        "target_acceptance_rate_min,application_round,students(name,grade)"
    )
    if limit:
        query = query.limit(limit)
    response = query.execute()
    rows = response.data or []

    merged_rows: list[dict[str, Any]] = []
    for row in rows:
        student = row.get("students") if isinstance(row.get("students"), dict) else {}
        merged = dict(row)
        merged["name"] = student.get("name")
        merged["grade"] = student.get("grade")
        merged_rows.append(merged)

    return merged_rows


def write_embeddings_to_supabase(
    supabase: Client,
    rows: list[dict[str, Any]],
    *,
    embed_col: str,
) -> None:
    can_write_left_overtime = True
    for row in rows:
        state_id = row.get("id")
        if not state_id:
            continue
        update_payload: dict[str, Any] = {embed_col: row.get(embed_col)}
        if can_write_left_overtime:
            update_payload["left_overtime"] = row.get("left_overtime")
        try:
            supabase.table("student_states").update(update_payload).eq("id", state_id).execute()
        except Exception as exc:
            if can_write_left_overtime and "left_overtime" in str(exc):
                can_write_left_overtime = False
                supabase.table("student_states").update({embed_col: row.get(embed_col)}).eq("id", state_id).execute()
            else:
                raise


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument(
        "--embed-col",
        default="student_embedding",
        help="Column name in student_states to store the embedding vector (default: student_embedding)",
    )
    ap.add_argument(
        "--batch-size", type=int, default=128,
        help="Texts per Voyage API call (default: 128)",
    )
    ap.add_argument(
        "--dry-run", action="store_true",
        help="Print concatenated texts without calling the API",
    )
    ap.add_argument(
        "--limit", type=int, default=None,
        help="Only process the first N rows (useful for testing)",
    )
    ap.add_argument(
        "--include-text", action="store_true",
        help="Include the concatenated text in the output (for debugging)",
    )
    args = ap.parse_args()

    supabase = _supabase_client()
    rows = load_rows_from_supabase(supabase, args.limit)

    rows = [enrich_row_with_left_overtime(row) for row in rows]

    logger.info("Loaded %d rows from Supabase (student_states + students)", len(rows))

    if args.dry_run:
        cfg = EmbeddingConfig(model="voyage-3")
        pipeline = EmbeddingPipeline.__new__(EmbeddingPipeline)
        pipeline.config = cfg
        for i, row in enumerate(rows):
            txt = pipeline.build_text(row, STUDENT_FIELDS)
            print(f"\n--- Row {i} ({row.get('name', '?')}) ---\n{txt}")
        return

    api_key = os.environ.get("VOYAGE_API_KEY")
    if not api_key:
        logger.error(
            "VOYAGE_API_KEY not set. Add it to python/.env or export it:\n"
            "  export VOYAGE_API_KEY=your_key_here"
        )
        sys.exit(1)

    config = EmbeddingConfig(model="voyage-3", batch_size=args.batch_size)
    pipeline = EmbeddingPipeline(api_key=api_key, config=config)

    embedded = pipeline.embed_rows(
        rows,
        STUDENT_FIELDS,
        embed_col=args.embed_col,
        include_text=args.include_text,
    )

    write_embeddings_to_supabase(
        supabase,
        embedded,
        embed_col=args.embed_col,
    )
    logger.info("Wrote %d embeddings to public.student_states.%s", len(embedded), args.embed_col)


if __name__ == "__main__":
    main()
