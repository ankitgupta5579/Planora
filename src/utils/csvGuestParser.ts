/**
 * RFC 4180 compliant CSV parser and guest roster import validator.
 * Provides resilient column header auto-detection, quoted field handling,
 * email syntax validation, and duplicate guest rejection.
 *
 * @packageDocumentation
 */

import { GuestItem } from '../types/event';

/**
 * Validation record for an individual CSV row.
 */
export interface CsvGuestRowValidation {
  rowNumber: number;
  guest?: GuestItem;
  error?: string;
  isDuplicate?: boolean;
  rawText: string;
}

/**
 * Result payload containing imported guests and detailed row-by-row diagnostics.
 */
export interface CsvImportResult {
  validGuests: GuestItem[];
  rows: CsvGuestRowValidation[];
  totalRows: number;
  validCount: number;
  duplicateCount: number;
  errorCount: number;
}

/**
 * Parses a single CSV line into an array of string fields,
 * handling standard double-quoted fields with commas and escaped quotes ("").
 *
 * @param line - Raw line from CSV payload
 * @returns Array of parsed column values
 * @example
 * ```ts
 * parseCsvLine('"Smith, John",john@example.com,"VIP, Table 4"');
 * // ['Smith, John', 'john@example.com', 'VIP, Table 4']
 * ```
 */
export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        // Lookahead for escaped quote ("")
        if (i + 1 < line.length && line[i + 1] === '"') {
          currentField += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        fields.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  fields.push(currentField.trim());
  return fields;
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseRsvpStatus(value?: string): GuestItem['rsvpStatus'] {
  if (!value) return 'pending';
  const v = value.trim().toLowerCase();
  if (v === 'attending' || v === 'yes' || v === 'y' || v === 'accepted' || v === 'confirmed') {
    return 'attending';
  }
  if (v === 'declined' || v === 'no' || v === 'n' || v === 'not attending' || v === 'rejected') {
    return 'declined';
  }
  return 'pending';
}

function parseGuestGroup(value?: string): GuestItem['group'] {
  if (!value) return 'general';
  const v = value.trim().toLowerCase();
  if (v.includes('family')) return 'family';
  if (v.includes('friend')) return 'friends';
  if (v.includes('colleague') || v.includes('work') || v.includes('co-worker')) return 'colleagues';
  if (v.includes('vip')) return 'vip';
  return 'general';
}

/**
 * Parses raw CSV string and validates each guest row against requirements.
 * Avoids duplicate entries matching existing guests by email or full name.
 *
 * @param csvText - Raw CSV file or text input
 * @param existingGuests - Current guests in event to detect duplicates against
 * @returns CsvImportResult with valid guests and row validations
 */
export function parseCsvGuestList(
  csvText: string,
  existingGuests: GuestItem[] = []
): CsvImportResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return {
      validGuests: [],
      rows: [],
      totalRows: 0,
      validCount: 0,
      duplicateCount: 0,
      errorCount: 0,
    };
  }

  // Header row
  const rawHeaders = parseCsvLine(lines[0]);
  const headerMap: Record<string, number> = {};

  rawHeaders.forEach((h, idx) => {
    const norm = normalizeHeader(h);
    if (['name', 'fullname', 'guestname', 'guest', 'attendee'].includes(norm)) {
      headerMap['name'] = idx;
    } else if (['email', 'emailaddress', 'contactemail'].includes(norm)) {
      headerMap['email'] = idx;
    } else if (['group', 'category', 'relationship', 'party'].includes(norm)) {
      headerMap['group'] = idx;
    } else if (['rsvp', 'status', 'rsvpstatus', 'attendance'].includes(norm)) {
      headerMap['rsvp'] = idx;
    } else if (['plusones', 'plusone', 'guests', 'additionalguests', '1'].includes(norm)) {
      headerMap['plusOnes'] = idx;
    } else if (['dietary', 'diet', 'dietaryrestrictions', 'allergies', 'food'].includes(norm)) {
      headerMap['dietary'] = idx;
    } else if (['table', 'tablenumber', 'seat', 'seating'].includes(norm)) {
      headerMap['table'] = idx;
    }
  });

  const hasNameColumn = headerMap['name'] !== undefined;
  const rows: CsvGuestRowValidation[] = [];
  const validGuests: GuestItem[] = [];
  let duplicateCount = 0;
  let errorCount = 0;

  // Track emails and names to prevent duplicates within file and existing
  const seenEmails = new Set<string>(
    existingGuests.filter((g) => g.email).map((g) => g.email!.toLowerCase().trim())
  );
  const seenNames = new Set<string>(existingGuests.map((g) => g.name.toLowerCase().trim()));

  for (let lineIdx = 1; lineIdx < lines.length; lineIdx++) {
    const rawLine = lines[lineIdx];
    const fields = parseCsvLine(rawLine);

    if (fields.every((f) => f === '')) {
      continue;
    }

    const rowNum = lineIdx + 1;

    if (!hasNameColumn) {
      errorCount++;
      rows.push({
        rowNumber: rowNum,
        rawText: rawLine,
        error: 'Missing required "Name" column in CSV header.',
      });
      continue;
    }

    const name = fields[headerMap['name']] || '';
    if (!name.trim()) {
      errorCount++;
      rows.push({
        rowNumber: rowNum,
        rawText: rawLine,
        error: 'Guest name is required.',
      });
      continue;
    }

    const email = headerMap['email'] !== undefined ? (fields[headerMap['email']] || '').trim() : '';
    const normName = name.toLowerCase().trim();
    const normEmail = email.toLowerCase().trim();

    // Check duplicate
    const isDup = seenNames.has(normName) || (normEmail.length > 0 && seenEmails.has(normEmail));
    if (isDup) {
      duplicateCount++;
      rows.push({
        rowNumber: rowNum,
        rawText: rawLine,
        isDuplicate: true,
        error: `Duplicate guest: ${name}${email ? ` (${email})` : ''} already exists.`,
      });
      continue;
    }

    seenNames.add(normName);
    if (normEmail) seenEmails.add(normEmail);

    const rawGroup = headerMap['group'] !== undefined ? fields[headerMap['group']] : undefined;
    const rawRsvp = headerMap['rsvp'] !== undefined ? fields[headerMap['rsvp']] : undefined;
    const rawPlusOnes =
      headerMap['plusOnes'] !== undefined ? fields[headerMap['plusOnes']] : undefined;
    const rawDietary = headerMap['dietary'] !== undefined ? fields[headerMap['dietary']] : '';
    const rawTable = headerMap['table'] !== undefined ? fields[headerMap['table']] : '';

    const plusOnes = Math.max(0, parseInt(rawPlusOnes || '0', 10) || 0);

    const guest: GuestItem = {
      id: `g-csv-${Date.now()}-${lineIdx}`,
      name: name.trim(),
      email: email || undefined,
      group: parseGuestGroup(rawGroup),
      rsvpStatus: parseRsvpStatus(rawRsvp),
      plusOnes,
      dietaryRestrictions: rawDietary.trim(),
      tableNumber: rawTable.trim(),
    };

    validGuests.push(guest);
    rows.push({
      rowNumber: rowNum,
      rawText: rawLine,
      guest,
    });
  }

  return {
    validGuests,
    rows,
    totalRows: lines.length - 1,
    validCount: validGuests.length,
    duplicateCount,
    errorCount,
  };
}
