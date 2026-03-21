import csv
import json
import os
import sys
import time
from pathlib import Path
from typing import Iterable

from exa_py import Exa

# Defaults aligned with `python/EXA_API_GUIDE.md` (Exa-recommended patterns).
_DEFAULT_GOOGLE_SEARCH_TYPE = "auto"  # balanced relevance and speed
# `max_age_hours=0` replaces deprecated `livecrawl="always"` (always fetch fresh text).
_DEFAULT_GET_CONTENTS_MAX_AGE_HOURS = 0

# QS list: one Exa response often truncates `universities_json` (~25 rows). Fetch rank ranges in chunks.
_QS_LIST_CHUNK_SIZE = 25

# Per-school Exa calls: transient gateway / rate-limit retries
_EXA_TRANSIENT_MAX_ATTEMPTS = 8
_EXA_TRANSIENT_BASE_DELAY_S = 2.0
_EXA_TRANSIENT_MAX_DELAY_S = 120.0


def _is_transient_exa_error(exc: BaseException) -> bool:
    msg = str(exc).lower()
    if any(code in msg for code in ("502", "503", "504", "429")):
        return True
    if "request failed" in msg and "status code" in msg:
        return True
    if "timeout" in msg or "timed out" in msg:
        return True
    if "connection" in msg and ("reset" in msg or "refused" in msg or "aborted" in msg):
        return True
    return False


def _retry_exa_call(
    fn,
    *,
    label: str,
    max_attempts: int = _EXA_TRANSIENT_MAX_ATTEMPTS,
    base_delay: float = _EXA_TRANSIENT_BASE_DELAY_S,
) -> object:
    last: BaseException | None = None
    for attempt in range(1, max_attempts + 1):
        try:
            return fn()
        except (ValueError, RuntimeError, OSError) as e:
            last = e
            if attempt < max_attempts and _is_transient_exa_error(e):
                wait = min(base_delay * (2 ** (attempt - 1)), _EXA_TRANSIENT_MAX_DELAY_S)
                print(
                    f"[exa_crawler] transient Exa error ({label}) attempt {attempt}/{max_attempts}: "
                    f"{e!s}; sleeping {wait:.0f}s",
                    file=sys.stderr,
                )
                time.sleep(wait)
                continue
            raise
    assert last is not None
    raise last


def read_completed_qs_ranks_from_jsonl(jsonl_path: Path) -> set[int]:
    """Return ``qs_rank`` values already present as complete JSON lines in the JSONL file."""
    done: set[int] = set()
    if not jsonl_path.exists():
        return done
    with jsonl_path.open(encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
                done.add(int(obj["qs_rank"]))
            except (json.JSONDecodeError, KeyError, TypeError, ValueError):
                continue
    return done


def _read_env_value(file_path: Path, key: str) -> str | None:
    if not file_path.exists():
        return None

    for line in file_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        parsed_key, parsed_value = stripped.split("=", 1)
        if parsed_key.strip() != key:
            continue
        value = parsed_value.strip().strip('"').strip("'")
        if value:
            return value
    return None


def _resolve_exa_api_key() -> str | None:
    env_key = os.environ.get("EXA_API_KEY")
    if env_key:
        return env_key

    # Try local and parent .env files so CLI works without manual export.
    candidates = [
        Path.cwd() / ".env",
        Path(__file__).resolve().parents[1] / ".env",
        Path(__file__).resolve().parents[2] / ".env",
    ]
    for candidate in candidates:
        file_key = _read_env_value(candidate, "EXA_API_KEY")
        if file_key:
            os.environ["EXA_API_KEY"] = file_key
            return file_key
    return None


def crawl_urls(
    urls: Iterable[str],
    *,
    text_max_characters: int = 2000,
    max_age_hours: int | None = _DEFAULT_GET_CONTENTS_MAX_AGE_HOURS,
) -> list[dict]:
    """Fetch webpage content via Exa `/contents` (text extraction).

    Args:
        urls: Collection of URLs to crawl.
        text_max_characters: Max characters returned per page.
        max_age_hours: Cache freshness window. ``0`` always fetches fresh content (replaces
            deprecated ``livecrawl="always"``). ``24`` uses cache when newer than 24h.
            ``None`` omits the parameter (API default: cache with livecrawl fallback).

    Returns:
        A list of dictionaries containing URL + crawled content fields.
    """
    api_key = _resolve_exa_api_key()
    if not api_key:
        raise RuntimeError("Missing EXA_API_KEY. Set it in environment or .env file.")

    url_list = [u for u in urls if u]
    if not url_list:
        return []

    exa = Exa(api_key=api_key)
    contents_kwargs: dict = {"text": {"max_characters": text_max_characters}}
    if max_age_hours is not None:
        contents_kwargs["max_age_hours"] = max_age_hours
    response = exa.get_contents(url_list, **contents_kwargs)

    results: list[dict] = []
    for item in response.results:
        results.append(
            {
                "url": item.url,
                "title": item.title,
                "text": item.text,
                "published_date": item.published_date,
            }
        )

    return results


def _get_exa_client() -> Exa:
    api_key = _resolve_exa_api_key()
    if not api_key:
        raise RuntimeError("Missing EXA_API_KEY. Set it in environment or .env file.")
    return Exa(api_key=api_key)


def _parse_json_string_to_list(raw: object) -> list:
    """Parse Exa output that may be a JSON array string (avoids schema array nesting)."""
    if raw is None:
        return []
    if isinstance(raw, list):
        return raw
    if isinstance(raw, str):
        s = raw.strip()
        if not s:
            return []
        try:
            data = json.loads(s)
        except json.JSONDecodeError:
            return []
        return data if isinstance(data, list) else []
    return []


# Canonical admissions parameters: one Exa row per id, fixed order (see get_university_searchable_parameters).
SEARCHABLE_PARAMETERS: list[tuple[str, str]] = [
    ("overall_acceptance_rate", "Overall university acceptance rate"),
    ("test_policy", "Test policy (required/optional/blind)"),
    ("english_test_requirements", "English test requirements"),
    (
        "application_pathways_eligibility",
        "Application pathways and eligibility by applicant type",
    ),
    ("deadline_calendar", "Deadline calendar (ED/EA/RD/program)"),
    (
        "program_supplemental_requirements",
        "Program-specific supplemental requirements",
    ),
    (
        "transfer_deferred_entry_options",
        "Official transfer/deferred-entry options",
    ),
    ("program_specific_acceptance_rate", "Program-specific acceptance rate"),
    (
        "acceptance_rate_by_residency",
        "Acceptance rate by residency (in-state/OOS/international)",
    ),
    ("admitted_gpa_percentiles", "Admitted GPA percentiles"),
    ("admitted_sat_act_percentiles", "Admitted SAT/ACT percentiles"),
    ("need_policy", "Need-aware vs need-blind policy"),
    ("class_profile_composition", "Class profile composition"),
    ("selectivity_trend", "3-5 year selectivity trend"),
    ("tuition_fees", "Tuition fees"),
    (
        "scholarship_deadlines_eligibility",
        "Scholarship deadlines and eligibility constraints",
    ),
    ("acceptance_rate_by_round", "Acceptance rate by round (ED/EA/RD)"),
    ("major_impaction_signals", "Major impaction/capacity signals"),
    ("average_aid_merit_statistics", "Average aid/merit statistics"),
    ("yield_rate", "Yield rate"),
    ("deferral_waitlist_indicators", "Deferral/waitlist behavior indicators"),
]


def _searchable_parameter_catalog_text() -> str:
    return "; ".join(f"{pid}: {label}" for pid, label in SEARCHABLE_PARAMETERS)


def _preview_exa_value(value: object, max_len: int = 1200) -> str:
    """Short string for verbose logs (truncated JSON or text)."""
    if value is None:
        return "None"
    try:
        if isinstance(value, (dict, list)):
            text = json.dumps(value, ensure_ascii=True)
        else:
            text = str(value)
    except Exception:
        text = repr(value)
    if len(text) > max_len:
        return text[:max_len] + "..."
    return text


def _qs_list_output_schema() -> dict:
    """Exa: no array-of-objects at depth — use JSON string field."""
    return {
        "type": "object",
        "properties": {
            "ranking_year": {"type": "string"},
            "source_url": {"type": "string"},
            "universities_json": {
                "type": "string",
                "description": (
                    "Valid JSON array string of objects: rank (int), university_name, country."
                ),
            },
        },
        "required": ["ranking_year", "source_url", "universities_json"],
    }


def _get_qs_rank_range_via_exa(
    exa: Exa,
    *,
    rank_lo: int,
    rank_hi: int,
    ranking_year: str,
    verbose: bool,
) -> list[dict]:
    """One structured Exa search for QS ranks ``rank_lo``..``rank_hi`` inclusive."""
    n = rank_hi - rank_lo + 1
    output_schema = _qs_list_output_schema()
    query = (
        f"Return exactly {n} universities from the QS World University Rankings for {ranking_year}: "
        f"official ranks {rank_lo} through {rank_hi} inclusive (no gaps). "
        "Use the official QS ranking page as the primary source."
    )
    system_prompt = (
        "Return ONLY the requested schema content. "
        f"universities_json MUST be a single JSON string that parses to an array of exactly {n} objects. "
        f"Each object: rank (integer from "
        f"{rank_lo} to {rank_hi}, each rank exactly once), university_name, country. "
        "Preserve official university names; escape quotes in JSON correctly."
    )

    for attempt in (1, 2):
        if verbose and attempt == 2:
            print(
                f"[exa_crawler] QS list ranks {rank_lo}-{rank_hi}: retry (attempt 2)",
                file=sys.stderr,
            )
        response = exa.search(
            query,
            type="deep",
            output_schema=output_schema,
            system_prompt=system_prompt,
        )

        content = response.output.content if response.output else {}
        if verbose:
            print(
                f"[exa_crawler] QS list ranks {rank_lo}-{rank_hi}: response.output "
                f"{'missing' if response.output is None else 'present'}",
                file=sys.stderr,
            )
        if not isinstance(content, dict):
            if verbose:
                print(
                    f"[exa_crawler] QS list ranks {rank_lo}-{rank_hi}: expected dict, got "
                    f"{type(content).__name__}: {_preview_exa_value(content, 400)}",
                    file=sys.stderr,
                )
            if attempt == 1:
                print(
                    f"[exa_crawler] QS list ranks {rank_lo}-{rank_hi}: invalid content; retry in 2s...",
                    file=sys.stderr,
                )
                time.sleep(2.0)
                continue
            return []
        if verbose:
            print(
                f"[exa_crawler] QS list ranks {rank_lo}-{rank_hi}: keys = {list(content.keys())}",
                file=sys.stderr,
            )
        raw_uni = content.get("universities_json")
        if raw_uni is None:
            raw_uni = content.get("universities")
        if verbose:
            print(
                f"[exa_crawler] QS list ranks {rank_lo}-{rank_hi}: universities_json type = "
                f"{type(raw_uni).__name__}, preview = {_preview_exa_value(raw_uni)}",
                file=sys.stderr,
            )
        parsed = _parse_json_string_to_list(raw_uni)
        if verbose:
            print(
                f"[exa_crawler] QS list ranks {rank_lo}-{rank_hi}: parsed {len(parsed)} row(s)",
                file=sys.stderr,
            )
        universities = [u for u in parsed if isinstance(u, dict) and "rank" in u]
        if verbose and len(parsed) and len(universities) < len(parsed):
            print(
                f"[exa_crawler] QS list ranks {rank_lo}-{rank_hi}: dropped "
                f"{len(parsed) - len(universities)} row(s) missing `rank`",
                file=sys.stderr,
            )
        universities_sorted = sorted(universities, key=lambda row: int(row["rank"]))
        out = [
            u
            for u in universities_sorted
            if rank_lo <= int(u["rank"]) <= rank_hi
        ]
        if verbose:
            print(
                f"[exa_crawler] QS list ranks {rank_lo}-{rank_hi}: "
                f"keeping {len(out)} row(s) in range (expected {n})",
                file=sys.stderr,
            )
        if out:
            if verbose and attempt == 2:
                print(
                    f"[exa_crawler] QS list ranks {rank_lo}-{rank_hi}: succeeded on second attempt",
                    file=sys.stderr,
                )
            return out
        if attempt == 1:
            print(
                f"[exa_crawler] QS list ranks {rank_lo}-{rank_hi}: empty; retry in 2s...",
                file=sys.stderr,
            )
            time.sleep(2.0)

    if verbose:
        print(
            f"[exa_crawler] QS list ranks {rank_lo}-{rank_hi}: empty after retry",
            file=sys.stderr,
        )
    return []


def get_qs_top_universities(
    *,
    limit: int = 250,
    ranking_year: str = "latest available",
    verbose: bool = False,
) -> list[dict]:
    """Fetch QS top universities as structured data via Exa (chunked rank ranges).

    A single Exa response often returns only ~25 rows in ``universities_json``; we request
    successive rank bands (default chunk size ``_QS_LIST_CHUNK_SIZE``) and merge.
    """
    if limit < 1:
        return []

    exa = _get_exa_client()
    by_rank: dict[int, dict] = {}
    chunk_size = _QS_LIST_CHUNK_SIZE

    for rank_lo in range(1, limit + 1, chunk_size):
        rank_hi = min(rank_lo + chunk_size - 1, limit)
        if verbose:
            print(
                f"[exa_crawler] QS list: fetching ranks {rank_lo}-{rank_hi} (overall limit={limit})",
                file=sys.stderr,
            )
        chunk_rows = _get_qs_rank_range_via_exa(
            exa,
            rank_lo=rank_lo,
            rank_hi=rank_hi,
            ranking_year=ranking_year,
            verbose=verbose,
        )
        for row in chunk_rows:
            r = int(row["rank"])
            if r not in by_rank:
                by_rank[r] = row

    merged = sorted(by_rank.values(), key=lambda row: int(row["rank"]))
    out = merged[:limit]

    if len(out) < limit and verbose:
        print(
            f"[exa_crawler] QS list: got {len(out)}/{limit} distinct ranks after chunked fetch "
            "(some rank ranges may have failed or returned incomplete data).",
            file=sys.stderr,
        )

    if not out and verbose:
        print(
            "[exa_crawler] QS list: empty — try --ranking-year \"latest available\" or check API key.",
            file=sys.stderr,
        )

    return out


def _normalize_admissions_parameter_row(row: dict) -> dict:
    """Map Exa response row to flat JSONL dict (stable field names).

    Exa structured rows use flat fields plus provenance_detail = \"confidence|evidence_note\".
    """
    if "parameter" in row and "provenance" in row:
        p = row.get("parameter") or {}
        v = row.get("provenance") or {}
        return {
            "rank": row.get("rank"),
            "parameter_id": str(p.get("id", "")),
            "parameter_name": str(p.get("name", "")),
            "coverage_tier": str(p.get("coverage_tier", "")),
            "value": str(p.get("value", "")),
            "value_unavailable": bool(p.get("value_unavailable", False)),
            "source_url": str(v.get("source_url", "")),
            "source_type": str(v.get("source_type", "other")),
            "confidence": str(v.get("confidence", "low")),
            "evidence_note": str(v.get("evidence_note", "")),
        }
    if "provenance_detail" in row:
        raw = str(row.get("provenance_detail", ""))
        conf, _, rest = raw.partition("|")
        conf = conf.strip().lower()
        if conf not in ("high", "medium", "low"):
            conf = "low"
        note = rest.strip()
        return {
            "rank": row.get("rank"),
            "parameter_id": str(row.get("parameter_id", "")),
            "parameter_name": str(row.get("parameter_name", "")),
            "coverage_tier": str(row.get("coverage_tier", "")),
            "value": str(row.get("value", "")),
            "value_unavailable": bool(row.get("value_unavailable", False)),
            "source_url": str(row.get("source_url", "")),
            "source_type": str(row.get("source_type", "other")),
            "confidence": conf,
            "evidence_note": note,
        }
    return row


def _normalize_major_row(row: dict) -> dict:
    """Map Exa major row to flat dict (provenance_detail split like admissions rows)."""
    if "provenance_detail" not in row:
        return {
            "rank": row.get("rank"),
            "major_name": str(row.get("major_name", "")),
            "degree_type": str(row.get("degree_type", "")),
            "strength_summary": str(row.get("strength_summary", "")),
            "source_url": str(row.get("source_url", "")),
            "source_type": str(row.get("source_type", "other")),
            "confidence": "low",
            "evidence_note": "",
        }
    raw = str(row.get("provenance_detail", ""))
    conf, _, rest = raw.partition("|")
    conf = conf.strip().lower()
    if conf not in ("high", "medium", "low"):
        conf = "low"
    note = rest.strip()
    return {
        "rank": row.get("rank"),
        "major_name": str(row.get("major_name", "")),
        "degree_type": str(row.get("degree_type", "")),
        "strength_summary": str(row.get("strength_summary", "")),
        "source_url": str(row.get("source_url", "")),
        "source_type": str(row.get("source_type", "other")),
        "confidence": conf,
        "evidence_note": note,
    }


def get_university_top_majors(
    university_name: str,
    *,
    country: str = "",
    ranking_year: str = "latest available",
) -> dict:
    """Fetch top 10 strongest majors/programs at a university via Exa deep search.

    Returns:
        Dict with keys: university_name, ranking_year, top_majors (list of up to 10 rows), sources.
    """
    exa = _get_exa_client()
    output_schema = {
        "type": "object",
        "properties": {
            "university_name": {"type": "string"},
            "ranking_year": {"type": "string"},
            "majors_json": {
                "type": "string",
                "description": (
                    "Valid JSON array string of exactly 10 objects. Each object: rank (1-10), "
                    "major_name, degree_type, strength_summary, source_url, source_type, "
                    "provenance_detail (format: confidence|evidence_note)."
                ),
            },
            "sources_json": {
                "type": "string",
                "description": (
                    "Valid JSON array string of URL strings (distinct https URLs used)."
                ),
            },
        },
        "required": ["university_name", "ranking_year", "majors_json", "sources_json"],
    }

    loc = f" in {country}" if country.strip() else ""
    query = (
        f"For {university_name}{loc}, identify the 10 best or strongest academic majors or degree "
        f"programs for {ranking_year}. "
        "Rank by combined signals: subject/reputation rankings (e.g. QS by subject, US News, "
        "peer reputation), department strength, career outcomes, and selectivity where known. "
        "Prefer widely recognized program names; include both undergraduate and graduate flagship "
        "programs if both are nationally leading."
    )
    system_prompt = (
        "You are building a machine-readable dataset. "
        "Return ONLY string fields majors_json and sources_json (no JSON arrays at top level). "
        "majors_json MUST be a single JSON string whose parse is an array of exactly 10 flat objects, "
        "ranks 1..10, no duplicate major_name. "
        "Each object fields: rank, major_name, degree_type, strength_summary, source_url, "
        "source_type, provenance_detail. "
        "degree_type: short label such as undergraduate, graduate, or both. "
        "strength_summary: one sentence on why this program ranks highly (rankings, reputation, outcomes). "
        "provenance_detail MUST be: <high|medium|low>|<short evidence note> (pipe after confidence). "
        "sources_json MUST be a JSON string of a string array of distinct https URLs used. "
        "Prefer official department pages and reputable ranking sources; aggregators as fallback. "
        "Escape quotes inside JSON strings correctly."
    )
    response = exa.search(
        query,
        type="deep-reasoning",
        output_schema=output_schema,
        system_prompt=system_prompt,
    )

    content = response.output.content if response.output else {}
    if not isinstance(content, dict):
        return {
            "university_name": university_name,
            "ranking_year": ranking_year,
            "top_majors": [],
            "sources": [],
        }

    raw = content.get("majors_json")
    if raw is None and "top_majors" in content:
        tm = content.get("top_majors")
        raw = tm if isinstance(tm, str) else None
    if isinstance(content.get("top_majors"), list):
        rows = content["top_majors"]
    else:
        rows = _parse_json_string_to_list(raw)

    rows_sorted = sorted(
        rows,
        key=lambda row: int(row.get("rank", 0)) if isinstance(row, dict) else 0,
    )
    normalized = [
        _normalize_major_row(r) for r in rows_sorted[:10] if isinstance(r, dict)
    ]

    out_sources_raw = content.get("sources_json")
    if out_sources_raw is None and "sources" in content:
        out_sources_raw = content.get("sources")
    out_sources = _parse_json_string_to_list(out_sources_raw)
    if not out_sources and isinstance(content.get("sources"), list):
        out_sources = content.get("sources", [])

    out_year = str(content.get("ranking_year", ranking_year))
    return {
        "university_name": str(content.get("university_name", university_name)),
        "ranking_year": out_year,
        "top_majors": normalized,
        "sources": [str(u) for u in out_sources if u],
    }


def get_university_searchable_parameters(
    university_name: str,
    *,
    ranking_year: str = "latest available",
) -> dict:
    """Fetch all canonical admissions-searchable parameters for one university via Exa deep search.

    Returns:
        Dict with keys: university_name, ranking_year, searchable_parameters (list of rows), sources.
    """
    exa = _get_exa_client()
    n = len(SEARCHABLE_PARAMETERS)
    # Exa: max nesting depth 2 — arrays of objects must be JSON-encoded strings.
    output_schema = {
        "type": "object",
        "properties": {
            "university_name": {"type": "string"},
            "ranking_year": {
                "type": "string",
                "description": "Cycle or year the facts apply to, e.g. 2026 or 2025-26.",
            },
            "parameters_json": {
                "type": "string",
                "description": (
                    f"Valid JSON array string of exactly {n} objects, one per canonical parameter_id. "
                    "Each object: rank, parameter_id, parameter_name, coverage_tier, value, "
                    "value_unavailable, source_url, source_type, provenance_detail "
                    "(format: confidence|evidence_note)."
                ),
            },
            "sources_json": {
                "type": "string",
                "description": (
                    "Valid JSON array string of URL strings (distinct https URLs used)."
                ),
            },
        },
        "required": ["university_name", "ranking_year", "parameters_json", "sources_json"],
    }

    catalog = _searchable_parameter_catalog_text()
    query = (
        f"For {university_name}, collect admissions-searchable parameters for {ranking_year}. "
        f"You MUST return exactly one row for EVERY parameter in this closed catalog ({n} total), "
        f"in this fixed order (parameter_id must match exactly): {catalog}. "
        "Do not skip parameters: if data is missing, set value_unavailable to true and explain in evidence."
    )
    system_prompt = (
        "You are building a machine-readable dataset. "
        "Return ONLY string fields parameters_json and sources_json (no JSON arrays at top level). "
        f"parameters_json MUST parse to an array of exactly {n} flat objects, ranks 1..{n}, "
        "in the same order as the canonical catalog in the user message. "
        "Each object MUST use the exact parameter_id from that catalog (snake_case). "
        "parameter_name should be the human label for that id. "
        "No duplicate parameter_id; no extra parameters; no omissions. "
        "Each object fields: rank, parameter_id, parameter_name, coverage_tier, value, value_unavailable, "
        "source_url, source_type, provenance_detail. "
        "provenance_detail MUST be: <high|medium|low>|<short evidence note> (pipe after confidence). "
        "sources_json MUST be a JSON string of a string array of distinct https URLs used. "
        "coverage_tier (high/medium/low per VNG): "
        "high=overall rate, test policy, English reqs, pathways, deadlines, supplementals, transfer; "
        "medium=program rate, residency splits, GPA/SAT percentiles, need policy, class profile, "
        "trend, scholarships; low=round splits, impaction, aid averages, yield, waitlist. "
        "Set value_unavailable true and provenance_detail starting with low| when data is missing. "
        "Prefer official admissions URLs; use aggregators only as fallback. "
        "Escape quotes inside JSON strings correctly."
    )
    response = exa.search(
        query,
        type="deep-reasoning",
        output_schema=output_schema,
        system_prompt=system_prompt,
    )

    content = response.output.content if response.output else {}
    if not isinstance(content, dict):
        return {
            "university_name": university_name,
            "ranking_year": ranking_year,
            "searchable_parameters": [],
            "sources": [],
        }

    params_raw = content.get("parameters_json")
    if params_raw is None:
        params_raw = content.get("top10_json")
    if params_raw is None and "top10" in content:
        params_raw = content.get("top10")

    if isinstance(content.get("searchable_parameters"), list):
        rows = content["searchable_parameters"]
    else:
        rows = _parse_json_string_to_list(params_raw)
    rows_sorted = sorted(
        rows,
        key=lambda row: int(row.get("rank", 0)) if isinstance(row, dict) else 0,
    )
    normalized = [
        _normalize_admissions_parameter_row(r) for r in rows_sorted if isinstance(r, dict)
    ]

    out_sources_raw = content.get("sources_json")
    if out_sources_raw is None and "sources" in content:
        out_sources_raw = content.get("sources")
    out_sources = _parse_json_string_to_list(out_sources_raw)
    if not out_sources and isinstance(content.get("sources"), list):
        out_sources = content.get("sources", [])

    out_year = str(content.get("ranking_year", ranking_year))
    return {
        "university_name": str(content.get("university_name", university_name)),
        "ranking_year": out_year,
        "searchable_parameters": normalized,
        "sources": [str(u) for u in out_sources if u],
    }


def get_university_top10(
    university_name: str,
    *,
    top10_topic: str = "",
    ranking_year: str = "latest available",
) -> dict:
    """Deprecated: use get_university_searchable_parameters. Kept for backward compatibility."""
    out = get_university_searchable_parameters(university_name, ranking_year=ranking_year)
    out["top10"] = out["searchable_parameters"]
    return out


QS_SCHOOL_CSV_FIELDS = ("rank", "university_name", "country")


def write_qs_schools_csv(csv_path: Path, schools: list[dict]) -> None:
    """Write QS school rows to comma-separated CSV (RFC-style quoting for embedded commas)."""
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    sorted_rows = sorted(schools, key=lambda r: int(r["rank"]))
    with csv_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(QS_SCHOOL_CSV_FIELDS)
        for row in sorted_rows:
            writer.writerow(
                [
                    int(row["rank"]),
                    str(row["university_name"]),
                    str(row["country"]),
                ]
            )


def read_qs_schools_csv(csv_path: Path) -> list[dict]:
    """Read QS school CSV written by `write_qs_schools_csv`."""
    with csv_path.open(encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        if reader.fieldnames is None:
            return []
        header = [h.strip() for h in reader.fieldnames]
        expected = list(QS_SCHOOL_CSV_FIELDS)
        if header != expected:
            raise ValueError(
                f"CSV header must be {expected}, got {header} ({csv_path})"
            )
        out: list[dict] = []
        for line in reader:
            if not line or not any(line.values()):
                continue
            out.append(
                {
                    "rank": int(line["rank"]),
                    "university_name": str(line["university_name"]),
                    "country": str(line["country"]),
                }
            )
    return sorted(out, key=lambda r: int(r["rank"]))


def build_qs_dataset_from_school_rows(
    universities: list[dict],
    *,
    ranking_year: str = "latest available",
    sleep_seconds: float = 0.0,
    include_top_majors: bool = True,
    verbose: bool = False,
    stream_jsonl_path: Path | None = None,
    resume: bool = False,
) -> tuple[list[dict], dict]:
    """One Exa admissions call (+ optional majors) per school; no QS list fetch.

    If ``stream_jsonl_path`` is set, each completed row is written to that file immediately
    (with flush) so you can ``tail -f`` the JSONL while the run is in progress.

    If ``resume`` is true and ``stream_jsonl_path`` exists, ranks already present in the file
    are skipped and new lines are **appended** (phase 2 continues after the last failure).

    Returns:
        ``(new_rows, meta)`` where ``meta`` includes ``resume_skipped`` and ``resumed`` flags.
    """
    meta: dict = {"resume_skipped": 0, "resumed": False}
    pending = universities
    mode = "w"
    if stream_jsonl_path is not None and resume:
        done_ranks = read_completed_qs_ranks_from_jsonl(stream_jsonl_path)
        meta["resume_skipped"] = len(done_ranks)
        meta["resumed"] = True
        pending = [u for u in universities if int(u["rank"]) not in done_ranks]
        if done_ranks:
            mode = "a"
        if verbose:
            print(
                f"[exa_crawler] Resume: skipping {len(done_ranks)} rank(s) already in JSONL; "
                f"{len(pending)} remaining",
                file=sys.stderr,
            )

    dataset: list[dict] = []
    stream_file = None
    if stream_jsonl_path is not None:
        stream_jsonl_path.parent.mkdir(parents=True, exist_ok=True)
        stream_file = stream_jsonl_path.open(mode, encoding="utf-8")

    if verbose and pending:
        print(
            f"[exa_crawler] Building rows for {len(pending)} universities "
            f"(top_majors={'on' if include_top_majors else 'off'}"
            f"{', streaming JSONL' if stream_file else ''})",
            file=sys.stderr,
        )
    elif verbose and not pending and universities:
        print(
            "[exa_crawler] Nothing to do — all schools already in JSONL (resume).",
            file=sys.stderr,
        )

    try:
        for uni in pending:
            university_name = str(uni["university_name"])
            country = str(uni["country"])
            rank_i = int(uni["rank"])
            payload = _retry_exa_call(
                lambda: get_university_searchable_parameters(
                    university_name,
                    ranking_year=ranking_year,
                ),
                label=f"admissions qs_rank={rank_i} {university_name[:40]}",
            )
            row: dict = {
                "qs_rank": rank_i,
                "university_name": university_name,
                "country": country,
                "ranking_year": payload.get("ranking_year", ranking_year),
                "sources": payload.get("sources", []),
                "searchable_parameters": payload.get("searchable_parameters", []),
            }
            if include_top_majors:
                majors = _retry_exa_call(
                    lambda: get_university_top_majors(
                        university_name,
                        country=country,
                        ranking_year=ranking_year,
                    ),
                    label=f"majors qs_rank={rank_i} {university_name[:40]}",
                )
                row["top_majors"] = majors.get("top_majors", [])
                row["majors_sources"] = majors.get("sources", [])
            else:
                row["top_majors"] = []
                row["majors_sources"] = []
            dataset.append(row)
            if stream_file is not None:
                stream_file.write(json.dumps(row, ensure_ascii=True) + "\n")
                stream_file.flush()
            if sleep_seconds > 0:
                time.sleep(sleep_seconds)
    finally:
        if stream_file is not None:
            stream_file.close()

    return dataset, meta


def build_qs_top250_dataset(
    *,
    ranking_year: str = "latest available",
    limit: int = 250,
    sleep_seconds: float = 0.0,
    include_top_majors: bool = True,
    verbose: bool = False,
    stream_jsonl_path: Path | None = None,
    resume: bool = False,
) -> tuple[list[dict], dict]:
    """Build dataset: QS list + full admissions parameters per university; optionally top 10 majors each."""
    universities = get_qs_top_universities(
        limit=limit, ranking_year=ranking_year, verbose=verbose
    )
    return build_qs_dataset_from_school_rows(
        universities,
        ranking_year=ranking_year,
        sleep_seconds=sleep_seconds,
        include_top_majors=include_top_majors,
        verbose=verbose,
        stream_jsonl_path=stream_jsonl_path,
        resume=resume,
    )


def build_qs_top250_dataset_csv_pipeline(
    *,
    ranking_year: str = "latest available",
    limit: int = 250,
    csv_path: Path,
    sleep_seconds: float = 0.0,
    include_top_majors: bool = True,
    verbose: bool = False,
    from_csv: Path | None = None,
    stream_jsonl_path: Path | None = None,
    resume: bool = False,
) -> tuple[list[dict], Path, dict]:
    """Two-phase: (1) QS list → CSV, or load CSV; (2) per-school admissions + majors Exa calls.

    If ``from_csv`` is set, phase 1 is skipped and schools are read from that file instead.

    If ``resume`` is true and ``csv_path`` already exists and ``from_csv`` is not set, phase 1
    Exa calls are skipped and schools are loaded from ``csv_path`` (same path as the first run).
    """
    if from_csv is not None:
        universities = read_qs_schools_csv(from_csv)
        if verbose:
            print(
                f"[exa_crawler] Loaded {len(universities)} schools from {from_csv}",
                file=sys.stderr,
            )
        effective_csv = from_csv
    elif resume and csv_path.exists():
        universities = read_qs_schools_csv(csv_path)
        if verbose:
            print(
                f"[exa_crawler] Resume: loaded {len(universities)} schools from existing "
                f"{csv_path} (skipped phase 1 QS Exa fetch)",
                file=sys.stderr,
            )
        effective_csv = csv_path
    else:
        universities = get_qs_top_universities(
            limit=limit, ranking_year=ranking_year, verbose=verbose
        )
        write_qs_schools_csv(csv_path, universities)
        if verbose:
            print(
                f"[exa_crawler] Wrote {len(universities)} schools to {csv_path}",
                file=sys.stderr,
            )
        effective_csv = csv_path

    dataset, meta = build_qs_dataset_from_school_rows(
        universities,
        ranking_year=ranking_year,
        sleep_seconds=sleep_seconds,
        include_top_majors=include_top_majors,
        verbose=verbose,
        stream_jsonl_path=stream_jsonl_path,
        resume=resume,
    )
    return dataset, effective_csv, meta


def google_search(
    query: str,
    *,
    num_results: int = 10,
    google_only: bool = False,
) -> list[dict]:
    """Run query search and return a simple parseable result shape."""
    exa = _get_exa_client()

    search_kwargs: dict = {
        "type": _DEFAULT_GOOGLE_SEARCH_TYPE,
        "num_results": num_results,
        "contents": {"highlights": {"max_characters": 600}},
    }
    if google_only:
        search_kwargs["include_domains"] = ["google.com"]

    response = exa.search(query, **search_kwargs)
    results: list[dict] = []
    for item in response.results:
        highlights = getattr(item, "highlights", None) or []
        snippet = highlights[0] if highlights else ""
        results.append(
            {
                "title": item.title,
                "url": item.url,
                "published_date": item.published_date,
                "snippet": snippet,
            }
        )
    return results
