#!/usr/bin/env python3
"""Translate crawler JSONL (qs-top250 output) into import-ready rows for Supabase.

Target schema: supabase/migrations/*_universities_admissions_wide.sql
  - public.universities (wide parameter columns + metadata)
  - public.majors (FK university_id, ranking_within_school = Exa rank)

Usage:
  cd python && source .venv/bin/activate
  python scripts/jsonl_to_supabase_import.py output/qs_top1_admissions_params.jsonl \\
    --output-dir import_ready

Outputs:
  - universities.jsonl / universities.csv
  - majors.jsonl / majors.csv
  - manifest.json (row counts + paths)

Deterministic UUIDs (uuid5) so re-running the script yields the same ids for the same
(qs_rank, university_name, country) — useful for upserts. Major ids are stable per
(university_id, ranking_within_school, major_name).
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

# Repo: run from python/ so exa_crawler is importable
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from exa_crawler.crawler import SEARCHABLE_PARAMETERS  # noqa: E402

PARAMETER_IDS = [pid for pid, _ in SEARCHABLE_PARAMETERS]


def _uni_key(qs_rank: int, name: str, country: str) -> str:
    return f"university:{qs_rank}:{name.strip()}:{country.strip()}"


def university_id_for_row(qs_rank: int, name: str, country: str) -> uuid.UUID:
    return uuid.uuid5(uuid.NAMESPACE_URL, _uni_key(qs_rank, name, country))


def major_id_for(university_id: uuid.UUID, rank: int, major_name: str) -> uuid.UUID:
    return uuid.uuid5(
        uuid.NAMESPACE_URL,
        f"major:{university_id}:{rank}:{major_name.strip()}",
    )


def parse_tuition_usd(tuition_fees_text: str | None) -> float | None:
    """Best-effort USD amount from tuition_fees prose (US-style $). UK £ etc. -> None."""
    if not tuition_fees_text:
        return None
    s = tuition_fees_text
    if "£" in s and "$" not in s:
        return None
    # First dollar amount with optional commas/decimals
    m = re.search(r"\$\s*([\d,]+(?:\.\d{1,2})?)", s)
    if not m:
        return None
    raw = m.group(1).replace(",", "")
    try:
        return float(raw)
    except ValueError:
        return None


def pick_website_url(record: dict) -> str | None:
    """Prefer first admissions-related https URL from sources or high-coverage params."""
    sources = record.get("sources") or []
    for u in sources:
        if isinstance(u, str) and u.startswith("https://"):
            return u
    for p in record.get("searchable_parameters") or []:
        if not isinstance(p, dict):
            continue
        u = p.get("source_url")
        if isinstance(u, str) and u.startswith("https://"):
            return u
    return None


def parameters_by_id(record: dict) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    for p in record.get("searchable_parameters") or []:
        if isinstance(p, dict) and p.get("parameter_id"):
            out[str(p["parameter_id"])] = p
    return out


def jsonl_to_rows(
    lines: list[dict[str, Any]],
    *,
    scraped_at: datetime | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    scraped = scraped_at or datetime.now(UTC)
    scraped_iso = scraped.replace(microsecond=0).isoformat()

    universities: list[dict[str, Any]] = []
    majors: list[dict[str, Any]] = []

    for record in lines:
        name = str(record.get("university_name", "")).strip()
        country = str(record.get("country", "")).strip()
        qs_rank = int(record["qs_rank"])
        uid = university_id_for_row(qs_rank, name, country)

        by_pid = parameters_by_id(record)

        uni: dict[str, Any] = {
            "id": str(uid),
            "name": name,
            "country": country or None,
            "qs_rank": qs_rank,
            "website_url": pick_website_url(record),
            "setting": None,
            "size_category": None,
            "ranking_year": str(record.get("ranking_year", "")) or None,
            "top10_topic": None,
            "scraped_at": scraped_iso,
            "search_embedding": None,
            "tuition_usd": None,
        }

        for pid in PARAMETER_IDS:
            p = by_pid.get(pid)
            uni[pid] = (p.get("value") if p else None) or None

        uni["tuition_usd"] = parse_tuition_usd(uni.get("tuition_fees") if isinstance(uni.get("tuition_fees"), str) else None)

        universities.append(uni)

        for m in record.get("top_majors") or []:
            if not isinstance(m, dict):
                continue
            rank = m.get("rank")
            try:
                rnk = int(rank) if rank is not None else None
            except (TypeError, ValueError):
                rnk = None
            maj_name = str(m.get("major_name", "")).strip()
            if not maj_name:
                continue
            mid = major_id_for(uid, rnk or 0, maj_name)
            majors.append(
                {
                    "id": str(mid),
                    "university_id": str(uid),
                    "major_name": maj_name,
                    "degree_type": str(m.get("degree_type", "")).strip() or None,
                    "ranking_within_school": rnk,
                    "source_url": str(m.get("source_url", "")).strip() or None,
                    "scraped_at": scraped_iso,
                }
            )

    return universities, majors


UNIVERSITY_COLUMNS: list[str] = [
    "id",
    "name",
    "country",
    "qs_rank",
    "website_url",
    "setting",
    "size_category",
    "ranking_year",
    "top10_topic",
    "scraped_at",
    "search_embedding",
    "tuition_usd",
    *PARAMETER_IDS,
]

MAJOR_COLUMNS = ["id", "university_id", "major_name", "degree_type", "ranking_within_school", "source_url", "scraped_at"]


def _csv_dialect() -> type[csv.excel]:
    class D(csv.excel):
        quoting = csv.QUOTE_MINIMAL

    return D


def write_csv(path: Path, columns: list[str], rows: list[dict[str, Any]]) -> None:
    buf = io.StringIO(newline="")
    w = csv.DictWriter(buf, fieldnames=columns, extrasaction="ignore", dialect=_csv_dialect())
    w.writeheader()
    for row in rows:
        out = {}
        for c in columns:
            v = row.get(c)
            if v is None:
                out[c] = ""
            elif c == "tuition_usd" and isinstance(v, float):
                out[c] = f"{v:.2f}"
            else:
                out[c] = v
        w.writerow(out)
    path.write_text(buf.getvalue(), encoding="utf-8")


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=True) + "\n")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("input_jsonl", type=Path, help="Crawler output JSONL (one university per line).")
    ap.add_argument(
        "--output-dir",
        type=Path,
        default=Path("import_ready"),
        help="Directory for generated files (created if missing).",
    )
    ap.add_argument(
        "--scraped-at",
        default="",
        help="ISO8601 scraped_at (default: now UTC). Example: 2026-03-21T12:00:00+00:00",
    )
    args = ap.parse_args()

    lines: list[dict[str, Any]] = []
    text = args.input_jsonl.read_text(encoding="utf-8")
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        lines.append(json.loads(line))

    scraped_at: datetime | None = None
    if args.scraped_at.strip():
        scraped_at = datetime.fromisoformat(args.scraped_at.replace("Z", "+00:00"))

    universities, majors = jsonl_to_rows(lines, scraped_at=scraped_at)

    out_dir = args.output_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    write_jsonl(out_dir / "universities.jsonl", universities)
    write_jsonl(out_dir / "majors.jsonl", majors)
    write_csv(out_dir / "universities.csv", UNIVERSITY_COLUMNS, universities)
    write_csv(out_dir / "majors.csv", MAJOR_COLUMNS, majors)

    manifest = {
        "source": str(args.input_jsonl.resolve()),
        "universities_count": len(universities),
        "majors_count": len(majors),
        "files": {
            "universities_jsonl": str((out_dir / "universities.jsonl").resolve()),
            "majors_jsonl": str((out_dir / "majors.jsonl").resolve()),
            "universities_csv": str((out_dir / "universities.csv").resolve()),
            "majors_csv": str((out_dir / "majors.csv").resolve()),
        },
        "university_columns": UNIVERSITY_COLUMNS,
        "major_columns": MAJOR_COLUMNS,
        "notes": [
            "universities.id and majors.id are deterministic uuid5 values for stable re-imports.",
            "Empty CSV cells mean NULL for text; tuition_usd empty means NULL.",
            "search_embedding is null in JSONL/CSV; set via app or SQL later.",
            "created_at/updated_at on universities use DB defaults on INSERT.",
        ],
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
