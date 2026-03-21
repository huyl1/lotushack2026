#!/usr/bin/env python3
"""
Enrich universities_deduped.csv using Qwen (DashScope) with concurrency, retries, and resume capability.
"""

import os
import sys
import json
import time
import pandas as pd
import numpy as np
import concurrent.futures
from pathlib import Path
from typing import Any, List, Dict
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
repo_root = Path(__file__).resolve().parents[2]
load_dotenv(repo_root / "python" / ".env")

API_KEY = os.environ.get("QWEN_API_KEY")
BASE_URL = os.environ.get("QWEN_BASE_URL", "https://dashscope-intl.aliyuncs.com/compatible-mode/v1")
MODEL_NAME = os.environ.get("QWEN_MODEL_NAME", "qwen3.5-122b-a10b")

ENRICH_FIELDS = [
    "country", "qs_rank", "tuition_usd", "overall_acceptance_rate", 
    "selectivity_trend", "acceptance_rate_by_round", "program_specific_acceptance_rate",
    "acceptance_rate_by_residency", "major_impaction_signals", "admitted_gpa_percentiles",
    "admitted_sat_act_percentiles", "class_profile_composition", "test_policy",
    "english_test_requirements", "application_pathways_eligibility", 
    "program_supplemental_requirements", "deadline_calendar", 
    "scholarship_deadlines_eligibility", "tuition_fees", "need_policy",
    "average_aid_merit_statistics", "yield_rate", "transfer_deferred_entry_options",
    "deferral_waitlist_indicators", "setting", "size_category"
]

def get_missing_fields(row: Dict[str, Any]) -> List[str]:
    missing = []
    for field in ENRICH_FIELDS:
        val = row.get(field)
        if pd.isna(val) or val is None or str(val).strip() == "" or str(val).lower() == "nan":
            missing.append(field)
    return missing

def construct_prompt(university_name: str, missing_fields: List[str]) -> str:
    fields_str = "\n".join([f"- {field}" for field in missing_fields])
    return f"""You are an educational consultant. Provide accurate data for "{university_name}".
Missing Fields:
{fields_str}
Return ONLY a JSON object. Numeric fields must be numbers, others strings. Use null if unknown.
"""

def enrich_row_worker(client: OpenAI, row: Dict[str, Any], retries: int = 3) -> Dict[str, Any]:
    name = row['name']
    missing = get_missing_fields(row)
    if not missing:
        return row
    
    prompt = construct_prompt(name, missing)
    for attempt in range(retries):
        try:
            print(f"Enriching {name} (Attempt {attempt+1}/{retries})...")
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                timeout=180
            )
            data = json.loads(response.choices[0].message.content)
            for field, value in data.items():
                if field in ENRICH_FIELDS:
                    row[field] = value
            return row
        except Exception as e:
            print(f"Error for {name} on attempt {attempt+1}: {e}")
            if attempt < retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                print(f"Failed all attempts for {name}")
    return row

def main():
    if not API_KEY:
        print("Error: QWEN_API_KEY not set.")
        sys.exit(1)

    client = OpenAI(api_key=API_KEY, base_url=BASE_URL)
    input_file = repo_root / "python" / "import_ready" / "universities_deduped.csv"
    output_file = repo_root / "python" / "import_ready" / "universities_enriched.csv"

    # Load input data
    df = pd.read_csv(input_file)
    rows_dict = df.to_dict(orient='records')
    
    # Check for existing progress to resume
    processed_names = set()
    if output_file.exists():
        try:
            df_existing = pd.read_csv(output_file)
            # Row is processed if it has at least one of the major rich fields populated
            # or we just trust the file. Let's trust the file and keep a list of already processed names.
            processed_names = set(df_existing['name'].tolist())
            print(f"Found {len(processed_names)} already processed universities. Resuming...")
            enriched_rows = df_existing.to_dict(orient='records')
        except:
            enriched_rows = []
    else:
        enriched_rows = []

    # Filter out already processed rows
    to_process = [r for r in rows_dict if r['name'] not in processed_names]

    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--workers", type=int, default=5)  # Reduced workers for stability
    args = parser.parse_args()
    
    if args.limit:
        to_process = to_process[:args.limit]

    total_to_process = len(to_process)
    print(f"Starting enrichment for {total_to_process} universities with {args.workers} workers...")
    
    if total_to_process > 0:
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
            future_to_name = {executor.submit(enrich_row_worker, client, row): row['name'] for row in to_process}
            for future in concurrent.futures.as_completed(future_to_name):
                name = future_to_name[future]
                try:
                    res_row = future.result()
                    enriched_rows.append(res_row)
                    # Periodic save (every 5 rows)
                    if len(enriched_rows) % 5 == 0:
                        pd.DataFrame(enriched_rows).to_csv(output_file, index=False)
                        print(f"Progress: {len(enriched_rows)}/{len(rows_dict)} entries in total saved.")
                except Exception as e:
                    print(f"Future for {name} generated an exception: {e}")

    # Final save
    pd.DataFrame(enriched_rows).to_csv(output_file, index=False)
    print(f"Done! Final data in {output_file}")

if __name__ == "__main__":
    main()
