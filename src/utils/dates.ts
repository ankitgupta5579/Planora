/**
 * Timezone-resilient date parsing and formatting utilities designed to prevent
 * daylight saving time (DST) and UTC offset off-by-one calendar drift.
 *
 * @packageDocumentation
 */

/**
 * Parses a date string into a local Date object set to local midnight (00:00:00.000).
 *
 * For "YYYY-MM-DD" formatted ISO strings, creates a local midnight Date and verifies
 * that the year, month, and day round-trip correctly (safely rejecting invalid dates
 * such as February 31st or month 13).
 *
 * @param value - Date string in ISO YYYY-MM-DD or standard parseable string format
 * @returns Valid local Date instance set to midnight, or null if invalid
 * @example
 * ```ts
 * parseLocalDate("2026-12-25"); // Local Date: Dec 25, 2026 00:00:00
 * parseLocalDate("2026-02-31"); // null (invalid calendar date)
 * ```
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
 *
 * @param dateValue - Target date as string or Date object
 * @param options - Intl.DateTimeFormatOptions configuration
 * @param locale - BCP 47 language tag (e.g. 'en-US')
 * @returns Human-readable localized date string
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
 * Calculates whole days remaining between fromDate and targetDate by comparing
 * their local midnights. Uses Math.round to remain resilient against DST transitions.
 *
 * @param targetDate - Future or past date string
 * @param fromDate - Reference anchor date (defaults to current system time)
 * @returns Signed integer count of calendar days remaining (>0 future, 0 today, <0 past)
 */
export function calculateDaysRemaining(targetDate: string, fromDate: Date = new Date()): number {
  if (!targetDate) return 0;
  const target = parseLocalDate(targetDate);
  if (!target || isNaN(target.getTime())) return 0;

  const fromMidnight = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate(),
    0,
    0,
    0,
    0
  );
  const targetMidnight = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
    0,
    0,
    0,
    0
  );

  const msPerDay = 86400000;
  const diffTime = targetMidnight.getTime() - fromMidnight.getTime();
  return Math.round(diffTime / msPerDay);
}
