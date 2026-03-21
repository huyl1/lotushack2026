#!/usr/bin/env python3
"""
Deduplicate universities from import_ready/universities.csv based on name.
Keep the row with the most non-empty information for each university.
"""

import os
import pandas as pd
from pathlib import Path

def main():
    # Paths relative to the repository root
    repo_root = Path(__file__).resolve().parents[2]
    input_file = repo_root / "python" / "import_ready" / "universities.csv"
    output_file = repo_root / "python" / "import_ready" / "universities_deduped.csv"

    if not input_file.exists():
        print(f"Error: Could not find {input_file}")
        return

    print(f"Reading {input_file}...")
    df = pd.read_csv(input_file)
    initial_count = len(df)
    print(f"Initial row count: {initial_count}")

    # Count non-null values for each row to prioritize rows with more information
    df['non_null_count'] = df.notnull().sum(axis=1)

    # Sort by name and non_null_count descending so that the first occurrence 
    # for each name is the one with the most information.
    df = df.sort_values(by=['name', 'non_null_count'], ascending=[True, False])

    # Drop duplicates by name, keeping the first (which has the most info)
    df_deduped = df.drop_duplicates(subset=['name'], keep='first')

    # Remove the helper column
    df_deduped = df_deduped.drop(columns=['non_null_count'])

    final_count = len(df_deduped)
    print(f"Final row count: {final_count}")
    print(f"Removed {initial_count - final_count} duplicates.")

    print(f"Writing deduped CSV to {output_file}...")
    df_deduped.to_csv(output_file, index=False)
    print("Done!")

if __name__ == "__main__":
    main()
