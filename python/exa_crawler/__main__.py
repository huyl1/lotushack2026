import argparse
import json
import sys
from pathlib import Path

from .crawler import (
    build_qs_top250_dataset,
    build_qs_top250_dataset_csv_pipeline,
    crawl_urls,
    google_search,
)


def _count_nonempty_jsonl_lines(path: Path) -> int:
    if not path.exists():
        return 0
    with path.open(encoding="utf-8") as file:
        return sum(1 for line in file if line.strip())


def main() -> None:
    parser = argparse.ArgumentParser(description="Exa crawler utilities.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    crawl_parser = subparsers.add_parser("crawl", help="Crawl one or more URLs.")
    crawl_parser.add_argument("urls", nargs="+", help="One or more URLs to crawl.")
    crawl_parser.add_argument(
        "--max-characters",
        type=int,
        default=2000,
        help="Maximum characters to retrieve per page text.",
    )
    crawl_parser.add_argument(
        "--max-age-hours",
        type=int,
        default=0,
        help="Exa contents freshness: 0=always fresh (default); e.g. 24=cache if <24h old.",
    )
    crawl_parser.add_argument(
        "--no-max-age",
        action="store_true",
        help="Omit max_age_hours (API default cache behavior). Overrides --max-age-hours.",
    )

    qs_parser = subparsers.add_parser(
        "qs-top250",
        help=(
            "Build dataset from QS top universities + full admissions parameters + "
            "top 10 majors per university (two Exa calls per school unless skipped)."
        ),
    )
    qs_parser.add_argument(
        "--limit",
        type=int,
        default=250,
        help="Number of universities to process (default: 250).",
    )
    qs_parser.add_argument(
        "--ranking-year",
        default="latest available",
        help="Ranking year hint for query context.",
    )
    qs_parser.add_argument(
        "--sleep-seconds",
        type=float,
        default=0.0,
        help="Delay between university queries to reduce API pressure.",
    )
    qs_parser.add_argument(
        "--no-top-majors",
        action="store_true",
        help="Skip the second Exa query (top 10 majors per university).",
    )
    qs_parser.add_argument(
        "--output-jsonl",
        default="qs_top250_parameters.jsonl",
        help="Output JSONL path; each line is written as each school finishes (tail -f friendly).",
    )
    qs_parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Log QS fetch diagnostics to stderr (useful when records_written is 0).",
    )
    qs_parser.add_argument(
        "--resume",
        action="store_true",
        help=(
            "Continue phase 2: skip qs_rank rows already in --output-jsonl; append new lines. "
            "Transient Exa errors (502, etc.) are retried with backoff before failing."
        ),
    )

    qs_csv_parser = subparsers.add_parser(
        "qs-top250-csv",
        help=(
            "Two-phase pipeline: one Exa call for QS top N → CSV, then per-school admissions + majors."
        ),
    )
    qs_csv_parser.add_argument(
        "--limit",
        type=int,
        default=250,
        help="Schools to fetch in phase 1 (default: 250). Ignored with --from-csv.",
    )
    qs_csv_parser.add_argument(
        "--ranking-year",
        default="latest available",
        help="Ranking year hint for QS list and per-school queries.",
    )
    qs_csv_parser.add_argument(
        "--sleep-seconds",
        type=float,
        default=0.0,
        help="Delay between per-school Exa calls.",
    )
    qs_csv_parser.add_argument(
        "--no-top-majors",
        action="store_true",
        help="Skip the majors Exa call per university.",
    )
    qs_csv_parser.add_argument(
        "--output-csv",
        default="output/qs_top250_schools.csv",
        help="Where to write (or expect) the QS school list CSV (phase 1).",
    )
    qs_csv_parser.add_argument(
        "--output-jsonl",
        default="qs_top250_parameters.jsonl",
        help="JSONL path; each line is written as each school finishes (tail -f friendly).",
    )
    qs_csv_parser.add_argument(
        "--from-csv",
        default=None,
        help="Skip phase 1: load schools from this CSV instead of calling Exa for the QS list.",
    )
    qs_csv_parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Log QS fetch / CSV path diagnostics to stderr.",
    )
    qs_csv_parser.add_argument(
        "--resume",
        action="store_true",
        help=(
            "Continue phase 2 from existing JSONL (skip completed qs_rank lines, append). "
            "If --output-csv exists, skip phase 1 QS fetch and reload schools from that CSV. "
            "Transient Exa errors are retried with backoff."
        ),
    )

    google_parser = subparsers.add_parser(
        "google-search",
        help="Run search query and print parseable JSON results.",
    )
    google_parser.add_argument("query", help="Search query text.")
    google_parser.add_argument(
        "--num-results",
        type=int,
        default=10,
        help="Number of search results to return.",
    )
    google_parser.add_argument(
        "--google-only",
        action="store_true",
        help="Restrict results to google.com domain only.",
    )

    args = parser.parse_args()

    if args.command == "crawl":
        max_age = None if args.no_max_age else args.max_age_hours
        results = crawl_urls(
            args.urls,
            text_max_characters=args.max_characters,
            max_age_hours=max_age,
        )
        print(json.dumps(results, indent=2, ensure_ascii=True))
        return

    if args.command == "google-search":
        results = google_search(
            args.query,
            num_results=args.num_results,
            google_only=args.google_only,
        )
        print(json.dumps(results, indent=2, ensure_ascii=True))
        return

    if args.command == "qs-top250-csv":
        csv_out = Path(args.output_csv)
        from_csv_path = Path(args.from_csv) if args.from_csv else None
        output_path = Path(args.output_jsonl)
        dataset, schools_csv, meta = build_qs_top250_dataset_csv_pipeline(
            ranking_year=args.ranking_year,
            limit=args.limit,
            csv_path=csv_out,
            sleep_seconds=args.sleep_seconds,
            include_top_majors=not args.no_top_majors,
            verbose=args.verbose,
            from_csv=from_csv_path,
            stream_jsonl_path=output_path,
            resume=args.resume,
        )

        if len(dataset) == 0:
            print(
                "[exa_crawler] records_written is 0 — no schools in QS step or CSV, "
                "or per-school rows empty (or all already done with --resume). "
                "Use -v; with --from-csv check the file path.",
                file=sys.stderr,
            )

        print(
            json.dumps(
                {
                    "status": "ok",
                    "pipeline": "qs-top250-csv",
                    "records_written_this_run": len(dataset),
                    "resume": args.resume,
                    "resume_skipped_ranks": meta.get("resume_skipped", 0),
                    "jsonl_total_lines": _count_nonempty_jsonl_lines(output_path),
                    "schools_csv": str(schools_csv),
                    "output_jsonl": str(output_path),
                },
                indent=2,
                ensure_ascii=True,
            )
        )
        return

    output_path = Path(args.output_jsonl)
    dataset, meta = build_qs_top250_dataset(
        ranking_year=args.ranking_year,
        limit=args.limit,
        sleep_seconds=args.sleep_seconds,
        include_top_majors=not args.no_top_majors,
        verbose=getattr(args, "verbose", False),
        stream_jsonl_path=output_path,
        resume=args.resume,
    )

    if len(dataset) == 0:
        print(
            "[exa_crawler] records_written is 0 — QS list step returned no schools, "
            "or all rows already in JSONL with --resume. "
            "Re-run with -v for details; confirm EXA_API_KEY and try "
            '--ranking-year "latest available".',
            file=sys.stderr,
        )

    print(
        json.dumps(
            {
                "status": "ok",
                "records_written_this_run": len(dataset),
                "resume": args.resume,
                "resume_skipped_ranks": meta.get("resume_skipped", 0),
                "jsonl_total_lines": _count_nonempty_jsonl_lines(output_path),
                "output_jsonl": str(output_path),
            },
            indent=2,
            ensure_ascii=True,
        )
    )


if __name__ == "__main__":
    main()
