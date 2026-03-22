#!/usr/bin/env python3
"""
Embed enriched universities from import_ready/universities_enriched.csv
using the voyage-3 pipeline and upload directly to Supabase.
"""

import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

repo_root = Path(__file__).resolve().parents[2]
load_dotenv(repo_root / ".env.development.local")
load_dotenv(repo_root / "python" / ".env")

# We need to import the embedding pipeline
sys.path.insert(0, str(repo_root / "python"))
from embeddings.pipeline import EmbeddingConfig, EmbeddingPipeline
from scripts.embed_universities import UNIVERSITY_FIELDS

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
VOYAGE_API_KEY = os.environ.get("VOYAGE_API_KEY")

def upload_batch(supabase: Client, table: str, batch: list[dict]):
    try:
        response = supabase.table(table).upsert(batch).execute()
        return response
    except Exception as e:
        print(f"Error uploading batch: {e}")
        return None

def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: Missing Supabase credentials.")
        sys.exit(1)
        
    if not VOYAGE_API_KEY:
        print("Error: VOYAGE_API_KEY not found.")
        sys.exit(1)

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    input_file = repo_root / "python" / "import_ready" / "universities_enriched.csv"

    if not input_file.exists():
        print(f"Error: {input_file} not found.")
        sys.exit(1)

    print(f"Reading {input_file}...")
    df = pd.read_csv(input_file)
    df = df.replace({np.nan: None})
    rows = df.to_dict(orient='records')

    print(f"Initializing embedding pipeline...")
    config = EmbeddingConfig(model="voyage-3", batch_size=128)
    pipeline = EmbeddingPipeline(api_key=VOYAGE_API_KEY, config=config)

    print(f"Embedding {len(rows)} rows...")
    embedded_rows = pipeline.embed_rows(
        rows,
        UNIVERSITY_FIELDS,
        embed_col="search_embedding",
        include_text=False
    )
    
    # We only need to upload id and search_embedding to update the vector,
    # but upserting all data is fine as well. Let's just upsert all for simplicity,
    # but dropping any None fields.
    print("Uploading embedded rows to Supabase...")
    batch_size = 500
    for i in range(0, len(embedded_rows), batch_size):
        batch = embedded_rows[i:i + batch_size]
        # Clean up any residual NaN/empty values in embeddings to prevent serialization errors
        for row in batch:
             for k, v in row.items():
                 if not isinstance(v, (list, dict)) and pd.isna(v) or v is None:
                     row[k] = None

        print(f"Uploading batch {i//batch_size + 1}...")
        res = upload_batch(supabase, "university_embeddings", batch)
        if res:
            print(f"Successfully uploaded batch {i//batch_size + 1}.")
        else:
            print(f"Failed to upload batch.")
            sys.exit(1)

    print("Embedding and upload complete!")

if __name__ == "__main__":
    main()
