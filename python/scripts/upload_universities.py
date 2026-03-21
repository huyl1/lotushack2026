#!/usr/bin/env python3
"""
Upload universities from import_ready/universities_deduped.csv
to the Supabase public.university_embeddings table.
Skipping search_embedding for now (to be updated later).
"""

import os
import sys
import pandas as pd
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
repo_root = Path(__file__).resolve().parents[2]
load_dotenv(repo_root / ".env.development.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

def upload_batch(supabase: Client, table: str, batch: list[dict[str, Any]]):
    """Upload a batch of data to Supabase."""
    try:
        # Use upsert to handle potential duplicates or re-runs
        response = supabase.table(table).upsert(batch).execute()
        return response
    except Exception as e:
        print(f"Error uploading batch: {e}")
        return None

def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.development.local")
        sys.exit(1)

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    input_file = repo_root / "python" / "import_ready" / "universities_deduped.csv"

    if not input_file.exists():
        print(f"Error: Could not find {input_file}")
        sys.exit(1)

    print(f"Reading {input_file}...")
    df = pd.read_csv(input_file)
    
    # Replace all NaN-like values with None (which becomes NULL in Supabase)
    import numpy as np
    df = df.replace({np.nan: None}).where(pd.notnull(df), None)
    
    # Convert to list of dicts for upload
    rows = df.to_dict(orient='records')

    total_rows = len(rows)
    print(f"Found {total_rows} rows to upload.")

    # Supabase insert/upsert limit is 1000 rows at once.
    batch_size = 1000
    for i in range(0, total_rows, batch_size):
        batch = rows[i:i + batch_size]
        print(f"Uploading batch {i//batch_size + 1} (rows {i} to {min(i + batch_size, total_rows)})...")
        res = upload_batch(supabase, "university_embeddings", batch)
        if res:
            print(f"Successfully uploaded batch.")
        else:
            print(f"Failed to upload batch starting at index {i}.")

    print("Upload complete!")

if __name__ == "__main__":
    main()
