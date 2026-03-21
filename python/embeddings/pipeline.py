"""
embeddings/pipeline.py
======================
Flexible table embedding pipeline using Voyage AI (voyage-3).

Design
------
- Works with **any** table schema — you pass a list of dicts (rows).
- You specify which fields to embed and (optionally) a weight per field.
- Weighted concatenation: each field's text is repeated proportionally to
  its weight (fractional weights → round to nearest integer repetitions).
  Alternatively you can use prefix-based weighting (field label is prefixed
  with N copies of a booster token that biases the model's attention).
- Batched API calls with configurable batch size.
- Returns rows with their embeddings attached (or a parallel list).

Usage (as a library)
--------------------
    from embeddings.pipeline import EmbeddingPipeline, FieldConfig

    pipeline = EmbeddingPipeline(api_key="voyage-…")

    rows = [
        {"name": "MIT", "country": "USA", "description": "Top tech school"},
        {"name": "Oxford", "country": "UK", "description": "Ancient university"},
    ]

    field_configs = [
        FieldConfig("name",        weight=3.0),   # most important
        FieldConfig("country",     weight=1.0),
        FieldConfig("description", weight=2.0),
    ]

    embedded = pipeline.embed_rows(rows, field_configs)
    # each item: {"name": ..., "embedding": [...1024 floats...]}

Usage (CLI)
-----------
    python -m embeddings.pipeline \\
        --input universities.jsonl \\
        --fields name:3 country:1 description:2 \\
        --output universities_embedded.jsonl \\
        --embed-col search_embedding
"""

from __future__ import annotations

import json
import logging
import math
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import voyageai

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Public types
# ---------------------------------------------------------------------------

@dataclass
class FieldConfig:
    """Configuration for a single field to embed.

    Parameters
    ----------
    name:
        The key in the row dict to embed.
    weight:
        Relative importance of this field (default 1.0).
        Weight is realised by repeating the field's text *round(weight)* times
        in the concatenated string, so weight=3 means the field appears 3×.
        Fractional weights are rounded to the nearest int (minimum 1).
    label:
        Optional human-readable prefix inserted before the value, e.g.
        "University:" to help the model understand context.
        Defaults to ``name.replace("_", " ").title()``.
    skip_if_empty:
        If True (default), a field whose value is None/empty string is omitted
        rather than contributing an empty label.
    """

    name: str
    weight: float = 1.0
    label: str | None = None
    skip_if_empty: bool = True

    def __post_init__(self) -> None:
        if self.label is None:
            self.label = self.name.replace("_", " ").title()
        if self.weight <= 0:
            raise ValueError(f"weight must be > 0, got {self.weight!r} for field {self.name!r}")

    @property
    def repetitions(self) -> int:
        """Number of times this field's text is repeated in the concat string."""
        return max(1, round(self.weight))


@dataclass
class EmbeddingConfig:
    """Global pipeline configuration."""

    model: str = "voyage-3"
    input_type: str = "document"   # "document" | "query" — controls Voyage optimisation
    batch_size: int = 128           # Voyage allows up to 128 per call
    truncation: bool = True         # truncate long texts to model's context window
    output_dimension: int | None = None  # None = model default (1024 for voyage-3)
    separator: str = " | "          # separator between fields in concatenation


# ---------------------------------------------------------------------------
# Core pipeline
# ---------------------------------------------------------------------------

class EmbeddingPipeline:
    """Embed arbitrarily-structured table rows using Voyage AI voyage-3.

    Parameters
    ----------
    api_key:
        Voyage AI API key. Falls back to ``VOYAGE_API_KEY`` env var.
    config:
        Global pipeline configuration (model name, batch size, …).
    """

    def __init__(
        self,
        api_key: str | None = None,
        config: EmbeddingConfig | None = None,
    ) -> None:
        key = api_key or os.environ.get("VOYAGE_API_KEY")
        if not key:
            raise ValueError(
                "Voyage AI API key is required. "
                "Pass api_key= or set the VOYAGE_API_KEY environment variable."
            )
        self._client = voyageai.Client(api_key=key)
        self.config = config or EmbeddingConfig()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def build_text(self, row: dict[str, Any], field_configs: list[FieldConfig]) -> str:
        """Concatenate chosen fields into a single embedding-ready string.

        The weight of each field is implemented by repeating its text segment
        ``FieldConfig.repetitions`` times in the concatenated output.  This
        naturally biases the embedding toward higher-weighted fields without
        any post-processing arithmetic.

        Parameters
        ----------
        row:
            A single table row (dict).
        field_configs:
            Ordered list of fields to include with their weights.

        Returns
        -------
        str
            Ready-to-embed text.  Empty string if no fields produced content.
        """
        parts: list[str] = []
        sep = self.config.separator

        for fc in field_configs:
            value = row.get(fc.name)
            if fc.skip_if_empty and (value is None or str(value).strip() == ""):
                continue
            snippet = f"{fc.label}: {value}".strip()
            # Repeat snippet according to weight
            for _ in range(fc.repetitions):
                parts.append(snippet)

        return sep.join(parts)

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Call Voyage API in batches and return all embeddings.

        Parameters
        ----------
        texts:
            List of pre-built text strings to embed.

        Returns
        -------
        list[list[float]]
            Embeddings in the same order as `texts`.
        """
        all_embeddings: list[list[float]] = []
        batch_size = self.config.batch_size
        n_batches = math.ceil(len(texts) / batch_size)

        for i in range(n_batches):
            batch = texts[i * batch_size : (i + 1) * batch_size]
            logger.info("Embedding batch %d/%d (%d texts)…", i + 1, n_batches, len(batch))

            kwargs: dict[str, Any] = {
                "input_type": self.config.input_type,
                "truncation": self.config.truncation,
            }
            if self.config.output_dimension is not None:
                kwargs["output_dimension"] = self.config.output_dimension

            result = self._client.embed(batch, model=self.config.model, **kwargs)
            all_embeddings.extend(result.embeddings)

        return all_embeddings

    def embed_rows(
        self,
        rows: list[dict[str, Any]],
        field_configs: list[FieldConfig],
        *,
        embed_col: str = "embedding",
        include_text: bool = False,
    ) -> list[dict[str, Any]]:
        """Embed a list of table rows and attach the embedding vector.

        Parameters
        ----------
        rows:
            Input rows (list of dicts — any schema).
        field_configs:
            Which fields to embed and their weights.
        embed_col:
            Key under which the embedding is stored in the output row.
        include_text:
            If True, also attach the built concatenation text under
            ``{embed_col}_text`` for inspection/debugging.

        Returns
        -------
        list[dict[str, Any]]
            Shallow copies of the input rows with the embedding attached.
        """
        if not rows:
            return []

        texts = [self.build_text(row, field_configs) for row in rows]
        embeddings = self.embed_texts(texts)

        output: list[dict[str, Any]] = []
        for row, emb, text in zip(rows, embeddings, texts):
            out = dict(row)
            out[embed_col] = emb
            if include_text:
                out[f"{embed_col}_text"] = text
            output.append(out)

        return output


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_field_spec(spec: str) -> FieldConfig:
    """Parse a CLI field specification string into a FieldConfig.

    Format: ``fieldname`` or ``fieldname:weight`` or ``fieldname:weight:Label``.

    Examples::

        "name"          → FieldConfig("name", weight=1.0)
        "name:3"        → FieldConfig("name", weight=3.0)
        "name:3:School" → FieldConfig("name", weight=3.0, label="School")
    """
    parts = spec.split(":", maxsplit=2)
    name = parts[0].strip()
    weight = float(parts[1]) if len(parts) >= 2 and parts[1].strip() else 1.0
    label = parts[2].strip() if len(parts) >= 3 and parts[2].strip() else None
    return FieldConfig(name=name, weight=weight, label=label)


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def _cli() -> None:
    import argparse

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )

    ap = argparse.ArgumentParser(
        description=(
            "Flexible table embedding pipeline (voyage-3).\n"
            "Reads a JSONL file, embeds chosen fields, writes embedded JSONL."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples
--------
# Embed universities by name (weight 3), country (1), and description (2)
python -m embeddings.pipeline \\
    --input universities.jsonl \\
    --fields "name:3" "country:1" "description:2" \\
    --output universities_embedded.jsonl \\
    --embed-col search_embedding

# Embed books by title and author, include the built text for inspection
python -m embeddings.pipeline \\
    --input books.jsonl \\
    --fields "title:5:Book Title" "author:2:Author" "genre:1" \\
    --output books_embedded.jsonl \\
    --include-text
        """,
    )
    ap.add_argument("--input", "-i", required=True, type=Path, help="Input JSONL file.")
    ap.add_argument(
        "--fields", "-f", nargs="+", required=True,
        help="Fields to embed. Format: fieldname[:weight[:label]]. E.g. 'name:3' 'country:1'",
    )
    ap.add_argument("--output", "-o", required=True, type=Path, help="Output JSONL file.")
    ap.add_argument(
        "--embed-col", default="embedding",
        help="Column name to store the embedding vector (default: embedding).",
    )
    ap.add_argument(
        "--model", default="voyage-3",
        help="Voyage AI model name (default: voyage-3).",
    )
    ap.add_argument(
        "--input-type", default="document", choices=["document", "query"],
        help="Voyage input_type optimisation (default: document).",
    )
    ap.add_argument(
        "--batch-size", type=int, default=128,
        help="Number of texts per Voyage API call (default: 128).",
    )
    ap.add_argument(
        "--include-text", action="store_true",
        help="Also write the concatenated text to <embed_col>_text for debugging.",
    )
    ap.add_argument(
        "--api-key",
        help="Voyage AI API key (default: VOYAGE_API_KEY env var).",
    )
    ap.add_argument(
        "--separator", default=" | ",
        help="Separator between field snippets in the concatenated text (default: ' | ').",
    )
    args = ap.parse_args()

    field_configs = [parse_field_spec(s) for s in args.fields]

    config = EmbeddingConfig(
        model=args.model,
        input_type=args.input_type,
        batch_size=args.batch_size,
        separator=args.separator,
    )
    pipeline = EmbeddingPipeline(api_key=args.api_key, config=config)

    # Load input
    rows: list[dict[str, Any]] = []
    text = args.input.read_text(encoding="utf-8")
    for line in text.splitlines():
        line = line.strip()
        if line:
            rows.append(json.loads(line))

    logger.info("Loaded %d rows from %s", len(rows), args.input)
    logger.info(
        "Field configs: %s",
        ", ".join(f"{fc.name}×{fc.repetitions}" for fc in field_configs),
    )

    embedded_rows = pipeline.embed_rows(
        rows,
        field_configs,
        embed_col=args.embed_col,
        include_text=args.include_text,
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as f:
        for row in embedded_rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    logger.info("Wrote %d embedded rows → %s", len(embedded_rows), args.output)


if __name__ == "__main__":
    _cli()
