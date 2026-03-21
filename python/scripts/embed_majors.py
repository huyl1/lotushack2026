#!/usr/bin/env python3
from __future__ import annotations

import argparse
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

MAJOR_FIELDS: list[FieldConfig] = [
    FieldConfig("major_name", weight=4.0, label="Major"),
    FieldConfig("acceptance_rate", weight=3.0, label="Major Acceptance Rate"),
    FieldConfig("supplemental_requirements", weight=2.0, label="Major Supplemental Requirements"),
    FieldConfig("subject_ranking", weight=2.0, label="Major Subject Ranking"),
    FieldConfig("ielts_min", weight=2.5, label="IELTS Minimum"),
    FieldConfig("toefl_min", weight=2.5, label="TOEFL Minimum"),
    FieldConfig("sat_min", weight=2.0, label="SAT Minimum"),
    FieldConfig("act_min", weight=2.0, label="ACT Minimum"),
    FieldConfig("gpa_min", weight=2.5, label="GPA Minimum"),
    FieldConfig("ib_min", weight=1.5, label="IB Minimum"),
    FieldConfig("university_name", weight=4.0, label="University"),
    FieldConfig("university_country", weight=2.0, label="Country"),
    FieldConfig("university_qs_rank", weight=2.0, label="University QS Rank"),
    FieldConfig("university_setting", weight=1.0, label="Campus Setting"),
    FieldConfig("university_size_category", weight=1.0, label="Campus Size"),
    FieldConfig("university_overall_acceptance_rate", weight=2.0, label="University Acceptance Rate"),
    FieldConfig("university_test_policy", weight=1.5, label="University Test Policy"),
    FieldConfig("university_need_policy", weight=1.5, label="University Financial Aid Need Policy"),
    FieldConfig("university_tuition_usd", weight=2.5, label="University Tuition USD"),
]


def supabase_client() -> Client:
    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        logger.error("SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
        sys.exit(1)
    return create_client(supabase_url, supabase_key)


def load_majors(
    supabase: Client,
    limit: int | None = None,
    *,
    page_size: int = 1000,
) -> list[dict[str, Any]]:
    columns = (
        "id,university_id,major_name,acceptance_rate,supplemental_requirements,subject_ranking,"
        "ielts_min,toefl_min,sat_min,act_min,gpa_min,ib_min"
    )
    rows: list[dict[str, Any]] = []
    start = 0

    while True:
        remaining = None if limit is None else (limit - len(rows))
        if remaining is not None and remaining <= 0:
            break

        current_page_size = page_size if remaining is None else min(page_size, remaining)
        end = start + current_page_size - 1

        batch = (
            supabase.table("majors")
            .select(columns)
            .range(start, end)
            .execute()
            .data
            or []
        )

        if not batch:
            break

        rows.extend(batch)

        if len(batch) < current_page_size:
            break

        start += len(batch)

    return rows


def load_universities_by_ids(supabase: Client, university_ids: list[str]) -> dict[str, dict[str, Any]]:
    if not university_ids:
        return {}
    out: dict[str, dict[str, Any]] = {}
    chunk_size = 500
    for i in range(0, len(university_ids), chunk_size):
        chunk = university_ids[i : i + chunk_size]
        response = (
            supabase.table("university_embeddings")
            .select(
                "id,name,country,qs_rank,setting,size_category,overall_acceptance_rate,"
                "test_policy,need_policy,tuition_usd"
            )
            .in_("id", chunk)
            .execute()
        )
        for row in response.data or []:
            uid = row.get("id")
            if uid:
                out[str(uid)] = row
    return out


def merge_major_with_university(
    majors: list[dict[str, Any]],
    university_map: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    merged_rows: list[dict[str, Any]] = []
    for major in majors:
        uid = str(major.get("university_id"))
        uni = university_map.get(uid, {})
        merged = dict(major)
        merged["university_name"] = uni.get("name")
        merged["university_country"] = uni.get("country")
        merged["university_qs_rank"] = uni.get("qs_rank")
        merged["university_setting"] = uni.get("setting")
        merged["university_size_category"] = uni.get("size_category")
        merged["university_overall_acceptance_rate"] = uni.get("overall_acceptance_rate")
        merged["university_test_policy"] = uni.get("test_policy")
        merged["university_need_policy"] = uni.get("need_policy")
        merged["university_tuition_usd"] = uni.get("tuition_usd")
        merged_rows.append(merged)
    return merged_rows


def write_embeddings_to_supabase(
    supabase: Client,
    rows: list[dict[str, Any]],
    *,
    embed_col: str,
) -> int:
    has_embed_column = True
    updated = 0
    for row in rows:
        major_id = row.get("id")
        if not major_id:
            continue
        if not has_embed_column:
            return updated
        try:
            supabase.table("majors").update({embed_col: row.get(embed_col)}).eq("id", major_id).execute()
            updated += 1
        except Exception as exc:
            if embed_col in str(exc):
                has_embed_column = False
                logger.error("Column %s does not exist on public.majors. Apply the migration first.", embed_col)
                return updated
            raise
    return updated


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--embed-col", default="major_embedding")
    ap.add_argument("--batch-size", type=int, default=128)
    ap.add_argument("--page-size", type=int, default=1000)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--include-text", action="store_true")
    args = ap.parse_args()

    supabase = supabase_client()
    major_rows = load_majors(supabase, args.limit, page_size=args.page_size)
    university_ids = [str(row["university_id"]) for row in major_rows if row.get("university_id")]
    university_map = load_universities_by_ids(supabase, list(set(university_ids)))
    rows = merge_major_with_university(major_rows, university_map)

    logger.info("Loaded %d majors from Supabase", len(rows))

    if args.dry_run:
        cfg = EmbeddingConfig(model="voyage-3")
        pipeline = EmbeddingPipeline.__new__(EmbeddingPipeline)
        pipeline.config = cfg
        for i, row in enumerate(rows):
            txt = pipeline.build_text(row, MAJOR_FIELDS)
            print(f"\n--- Row {i} ({row.get('major_name', '?')}) ---\n{txt}")
        return

    api_key = os.environ.get("VOYAGE_API_KEY")
    if not api_key:
        logger.error("VOYAGE_API_KEY not set.")
        sys.exit(1)

    config = EmbeddingConfig(model="voyage-3", batch_size=args.batch_size)
    pipeline = EmbeddingPipeline(api_key=api_key, config=config)
    embedded = pipeline.embed_rows(
        rows,
        MAJOR_FIELDS,
        embed_col=args.embed_col,
        include_text=args.include_text,
    )
    updated = write_embeddings_to_supabase(
        supabase,
        embedded,
        embed_col=args.embed_col,
    )
    logger.info("Wrote %d embeddings to public.majors.%s", updated, args.embed_col)


if __name__ == "__main__":
    main()
