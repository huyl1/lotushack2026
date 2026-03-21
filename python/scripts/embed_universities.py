#!/usr/bin/env python3
"""
Embed universities from import_ready/universities.jsonl using the voyage-3
embedding pipeline and write the result back to import_ready/universities_embedded.jsonl.

Usage
-----
    cd python
    source .venv/bin/activate
    python scripts/embed_universities.py

    # Or specify paths explicitly:
    python scripts/embed_universities.py \\
        --input import_ready/universities.jsonl \\
        --output import_ready/universities_embedded.jsonl

    # Dry-run: just print the first 3 concatenated texts without calling API
    python scripts/embed_universities.py --dry-run --limit 3

Environment
-----------
    VOYAGE_API_KEY  — your Voyage AI key
    (falls back to python/.env)
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from pathlib import Path

# Allow running from any working directory
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv

# Load python/.env if present
load_dotenv(Path(__file__).resolve().parents[1] / ".env")
# Also try repo-root .env for VOYAGE_API_KEY
load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=False)

from embeddings.pipeline import EmbeddingConfig, EmbeddingPipeline, FieldConfig

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# University-specific field configuration
# Columns sourced from: public.universities schema
# Adjust weights to change which fields dominate the embedding.
# ---------------------------------------------------------------------------
UNIVERSITY_FIELDS: list[FieldConfig] = [
    # Core identity — highest importance
    FieldConfig("name",                    weight=4.0, label="University"),
    FieldConfig("country",                 weight=2.0, label="Country"),
    FieldConfig("region",                  weight=1.5, label="Region"),
    FieldConfig("qs_rank",                 weight=1.5, label="QS Rank"),

    # Academic character
    FieldConfig("focus",                   weight=2.0, label="Academic Focus"),
    FieldConfig("research",                weight=2.0, label="Research Strengths"),
    FieldConfig("setting",                 weight=0.5, label="Campus Setting"),
    FieldConfig("size_category",           weight=0.5, label="Size"),

    # Admissions
    FieldConfig("overall_acceptance_rate", weight=2.0, label="Acceptance Rate"),
    FieldConfig("test_policy",             weight=1.5, label="Test Policy"),
    FieldConfig("deadline_calendar",       weight=1.0, label="Application Deadline"),
    FieldConfig("financial_aid",           weight=1.0, label="Financial Aid"),

    # Financials
    FieldConfig("tuition_usd",             weight=1.0, label="Tuition USD"),

    # QS sub-scores (lower individual weight; collectively informative)
    FieldConfig("overall_score",           weight=1.5, label="Overall QS Score"),
    FieldConfig("ar_score",                weight=1.0, label="Academic Reputation Score"),
    FieldConfig("er_score",                weight=1.0, label="Employer Reputation Score"),
    FieldConfig("fsr_score",               weight=0.5, label="Faculty Student Ratio Score"),
    FieldConfig("cpf_score",               weight=0.5, label="Citations per Faculty Score"),
    FieldConfig("ifr_score",               weight=0.5, label="International Faculty Score"),
    FieldConfig("isr_score",               weight=0.5, label="International Students Score"),
    FieldConfig("isd_score",               weight=0.5, label="International Research Score"),
    FieldConfig("irn_score",               weight=0.5, label="Int'l Research Network Score"),
    FieldConfig("eo_score",                weight=0.5, label="Employment Outcomes Score"),
    FieldConfig("sus_score",               weight=0.5, label="Sustainability Score"),
]


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument(
        "--input", "-i",
        type=Path,
        default=Path("import_ready/universities.jsonl"),
        help="Input JSONL (default: import_ready/universities.jsonl)",
    )
    ap.add_argument(
        "--output", "-o",
        type=Path,
        default=Path("import_ready/universities_embedded.jsonl"),
        help="Output JSONL (default: import_ready/universities_embedded.jsonl)",
    )
    ap.add_argument(
        "--embed-col",
        default="search_embedding",
        help="Column name for the embedding vector (default: search_embedding)",
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

    # Load rows
    rows = []
    text = args.input.read_text(encoding="utf-8")
    for line in text.splitlines():
        line = line.strip()
        if line:
            rows.append(json.loads(line))

    if args.limit:
        rows = rows[: args.limit]

    logger.info("Loaded %d rows from %s", len(rows), args.input)

    if args.dry_run:
        # Just build and print texts (EmbeddingPipeline imported at top level)
        cfg = EmbeddingConfig(model="voyage-3")
        pipeline = EmbeddingPipeline.__new__(EmbeddingPipeline)
        pipeline.config = cfg
        for i, row in enumerate(rows):
            txt = pipeline.build_text(row, UNIVERSITY_FIELDS)
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
        UNIVERSITY_FIELDS,
        embed_col=args.embed_col,
        include_text=args.include_text,
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as f:
        for row in embedded:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    logger.info("Wrote %d embedded rows → %s", len(embedded), args.output)


if __name__ == "__main__":
    main()
