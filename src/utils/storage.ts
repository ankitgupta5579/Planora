/**
 * Local persistence and migration manager for celebration plans.
 * Manages localStorage synchronization, schema migrations, and markdown/json exports.
 *
 * @packageDocumentation
 */

import { EventPlan } from '../types/event';
import { SAMPLE_EVENTS } from './sampleData';
import { formatLocalDate } from './dates';

const STORAGE_VERSION = 'v5';
const STORAGE_KEY_VERSION = 'celebration_storage_version';
const STORAGE_KEY_EVENTS = 'celebration_events_v5';
const STORAGE_KEY_ACTIVE_ID = 'celebration_active_event_id_v5';

/**
 * Checks whether the browser's localStorage API is defined and available.
 */
function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Loads all saved celebration events from local browser storage.
 * Performs automated version upgrade and seeds with sample events if empty or corrupt.
 *
 * @returns Array of valid EventPlan records
 */
export function loadSavedEvents(): EventPlan[] {
  if (!isStorageAvailable()) return SAMPLE_EVENTS;
  try {
    const version = localStorage.getItem(STORAGE_KEY_VERSION);
    if (version !== STORAGE_VERSION) {
      localStorage.setItem(STORAGE_KEY_VERSION, STORAGE_VERSION);
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(SAMPLE_EVENTS));
      return SAMPLE_EVENTS;
    }
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (!raw) {
      // Seed with sample events
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(SAMPLE_EVENTS));
      return SAMPLE_EVENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SAMPLE_EVENTS;
  } catch (err) {
    console.warn('Failed to load events from localStorage:', err);
    return SAMPLE_EVENTS;
  }
}

/**
 * Restores the event database to fresh sample events and resets the active selection.
 *
 * @returns Fresh default sample events
 */
export function resetToSampleEvents(): EventPlan[] {
  if (isStorageAvailable()) {
    localStorage.setItem(STORAGE_KEY_VERSION, STORAGE_VERSION);
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(SAMPLE_EVENTS));
    localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
  }
  return SAMPLE_EVENTS;
}

/**
 * Persists the complete list of celebration plans into local storage.
 *
 * @param events - Complete array of EventPlan objects
 */
export function saveAllEvents(events: readonly EventPlan[]): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEY_VERSION, STORAGE_VERSION);
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to localStorage:', err);
  }
}

/**
 * Retrieves the currently active event ID from local storage.
 * Validates that the active ID exists in the provided event array.
 *
 * @param events - Current list of known events
 * @returns Active event ID string, or fallback to first available event ID
 */
export function getActiveEventId(events: readonly EventPlan[]): string {
  if (!isStorageAvailable()) return events[0]?.id || '';
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (saved && events.some((e) => e.id === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return events[0]?.id || '';
}

/**
 * Sets and persists the ID of the currently selected event.
 *
 * @param id - Selected event unique identifier
 */
export function setActiveEventId(id: string): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch {
    // ignore
  }
}

/**
 * Triggers a client-side download of the celebration plan as formatted JSON.
 *
 * @param plan - EventPlan record to serialize
 */
export function exportPlanAsJson(plan: EventPlan): void {
  const dataStr =
    'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute(
    'download',
    `${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_plan.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Generates an executive Markdown summary dossier of the event plan.
 *
 * @param plan - EventPlan record
 * @returns Fully formatted Markdown document string
 */
export function exportPlanAsMarkdown(plan: EventPlan): string {
  const dateFormatted = formatLocalDate(plan.date, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let md = `# 🎊 ${plan.title}\n\n`;
  md += `**Event Type:** ${plan.type.toUpperCase()} | **Vibe:** ${plan.vibe} | **Date:** ${dateFormatted}\n`;
  md += `**Location:** ${plan.location} | **Headcount:** ${plan.guestCount} guests | **Total Budget:** ${plan.currency}${plan.totalBudget.toLocaleString()}\n\n`;
  md += `### 🌟 Creative Theme & Vision\n${plan.themeDescription}\n\n`;

  md += `### 🎨 Color Palette\n`;
  for (const c of plan.colorPalette) {
    md += `- **${c.name}**: \`${c.hex}\`\n`;
  }
  md += `\n`;

  md += `### 💰 Budget Breakdown\n`;
  md += `| Category | Item | Allocated | Actual Spent | Status |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  for (const b of plan.budgetItems) {
    md += `| ${b.category.toUpperCase()} | ${b.title} | ${plan.currency}${b.allocatedAmount.toLocaleString()} | ${plan.currency}${b.actualAmount.toLocaleString()} | ${b.isPaid ? 'Paid' : 'Pending'} |\n`;
  }
  md += `\n`;

  md += `### 📅 Milestones & Timeline\n`;
  for (const t of plan.timelineItems) {
    md += `- [${t.completed ? 'x' : ' '}] **${t.timeLabel || t.phase}**: ${t.title} ${t.assignedTo ? `(Assignee: ${t.assignedTo})` : ''}\n  _${t.description}_\n`;
  }
  md += `\n`;

  md += `### 🤝 Vendor Directory\n`;
  for (const v of plan.vendors) {
    md += `#### ${v.category}: ${v.name} (${v.status.replace('_', ' ').toUpperCase()})\n`;
    if (v.contactName)
      md += `- **Contact:** ${v.contactName} (${v.phone || ''} ${v.email || ''})\n`;
    md += `- **Quote:** ${plan.currency}${v.quoteAmount} | **Deposit Paid:** ${plan.currency}${v.depositPaid}\n`;
    if (v.notes) md += `- **Notes:** ${v.notes}\n`;
    if (v.checklist && v.checklist.length > 0) {
      md += `- **Checklist:** ${v.checklist.join(', ')}\n`;
    }
    md += `\n`;
  }

  md += `### 💡 Personalized Ideas & Concepts\n`;
  for (const idea of plan.ideas) {
    md += `- **${idea.title}** (${idea.category}): ${idea.description} [${idea.tags.join(', ')}]\n`;
  }

  return md;
}
