/**
 * Filters junk segments from VALSEA realtime (code-fence glitches, punctuation-only, etc.)
 * so we do not persist or show them in the transcript UI.
 */

function hasLetterOrNumber(s: string): boolean {
  return /\p{L}|\p{N}/u.test(s);
}

/**
 * True when this segment should not be shown or saved (empty, ```.```, "...", etc.).
 */
export function shouldDiscardTranscriptSegment(text: string): boolean {
  const t = text.trim();
  if (t.length === 0) return true;

  // No linguistic content at all (punctuation, backticks, spaces only)
  if (!hasLetterOrNumber(t)) return true;

  return false;
}

/** Normalize for duplicate detection (casing, Unicode compatibility). */
export function normalizeTranscriptForDedupe(text: string): string {
  try {
    return text.normalize("NFKC").trim().toLocaleLowerCase("vi");
  } catch {
    return text.normalize("NFKC").trim().toLowerCase();
  }
}

/** Short utterances get a cooldown — stops VALSEA from spamming the same word with no real speech. */
export const DEDUPE_SHORT_PHRASE_MAX_LEN = 14;
export const DEDUPE_SHORT_PHRASE_COOLDOWN_MS = 4500;
