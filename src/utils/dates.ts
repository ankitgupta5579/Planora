/**
 * Date parsing and formatting utilities designed to prevent timezone and DST off-by-one errors.
 */

/**
 * Parses a date string into a local Date object set to local midnight.
 * For "YYYY-MM-DD" formatted strings, creates local midnight and verifies that
 * the year, month, and day round-trip correctly (rejecting dates like 2026-02-31).
 * For other strings, falls back to new Date(value).
 * Returns null if the date is invalid.
 */
export function parseLocalDate(value: string): Date | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (ymdMatch) {
    const year = Number(ymdMatch[1]);
    const month = Number(ymdMatch[2]);
    const day = Number(ymdMatch[3]);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    // Validate round-trip to prevent dates like 2026-02-31 rolling over into March
    if (
      localDate.getFullYear() !== year ||
      localDate.getMonth() !== month - 1 ||
      localDate.getDate() !== day
    ) {
      return null;
    }
    return localDate;
  }

  const fallback = new Date(trimmed);
  if (isNaN(fallback.getTime())) {
    return null;
  }
  return fallback;
}

/**
 * Formats a date string or Date object using local date components so date-only
 * strings ("YYYY-MM-DD") are never shifted by UTC offsets.
 */
export function formatLocalDate(
  dateValue: string | Date,
  options?: Intl.DateTimeFormatOptions,
  locale?: string
): string {
  const d = typeof dateValue === 'string' ? parseLocalDate(dateValue) : dateValue;
  if (!d || isNaN(d.getTime())) {
    return typeof dateValue === 'string' ? dateValue : '';
  }
  return d.toLocaleDateString(locale, options);
}

/**
 * Calculates days remaining between fromDate and targetDate by comparing
 * their local midnights. Uses Math.round to remain resilient against DST transitions.
 */
export function calculateDaysRemaining(targetDate: string, fromDate: Date = new Date()): number {
  if (!targetDate) return 0;
  const target = parseLocalDate(targetDate);
  if (!target || isNaN(target.getTime())) return 0;

  const fromMidnight = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate(),
    0, 0, 0, 0
  );
  const targetMidnight = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
    0, 0, 0, 0
  );

  const msPerDay = 86400000;
  const diffTime = targetMidnight.getTime() - fromMidnight.getTime();
  return Math.round(diffTime / msPerDay);
}
