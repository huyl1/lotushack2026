import type { FilterKey } from "./student.types";

export const MATCHING_STEPS = [
  "Fetching student profile...",
  "Filtering university candidates...",
  "Computing semantic rankings...",
  "Running AI scoring model...",
  "Persisting recommendations...",
];

export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "reach", label: "Reach" },
  { key: "match", label: "Match" },
  { key: "safety", label: "Safety" },
];
