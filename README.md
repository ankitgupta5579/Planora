<p align="center">
  <img src="public/planora-icon-256.png" alt="Planora logo" width="96" height="96" />
</p>

# Planora — Celebration & Event Planner AI

> **Plan today, celebrate tomorrow.** A smart, dynamic GenAI assistant for milestone celebrations, weddings, birthdays, and community festivals.

[![Test Suite](https://img.shields.io/badge/tests-137%20passed-brightgreen.svg)](#testing)
[![WCAG 2.1 AA](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-blue.svg)](#accessibility-notes-wcag-21-aa)
[![TypeScript](https://img.shields.io/badge/typescript-strict-informational.svg)](#code-quality)
[![GitHub Repository](https://img.shields.io/badge/github-ankitgupta5579%2Fevent--planner-181717.svg?logo=github)](https://github.com/ankitgupta5579/event-planner)

- **Public Repository**: [https://github.com/ankitgupta5579/event-planner](https://github.com/ankitgupta5579/event-planner)
- **Live Demo Port**: `http://localhost:3000` (runs locally with or without an API key)

---

## 1. Chosen Vertical

### Celebration & Event Planning
Event and celebration planning is a high-stakes, multi-variable domain involving financial constraints, hard chronological deadlines, vendor negotiations, guest dietary risks, and creative direction. 

Hosts, couples, families, and community coordinators frequently struggle with fragmented tools (spreadsheets, chat apps, note-taking apps, calendars) that cannot talk to one another. A budget overrun in catering often goes unnoticed until vendor deposits are due; a guest's severe nut allergy is easily buried in a spreadsheet row; and vendor inquiry emails consume hours of repetitive drafting.

**Planora** solves this by unifying every dimension of event coordination into a single, cohesive, context-aware system:
- **Milestone Weddings & Anniversaries**: Ceremony logistics, cocktail hours, seating charts, and delicate timelines.
- **Birthday & Milestone Parties**: Themes, entertainment, custom drink bars, and photo backdrops.
- **Community Festivals & 5K Runs**: Crowd permits, sanitation, volunteer coordination, and large-scale safety.
- **Corporate Offsites & Gatherings**: Keynote staging, farm-to-table catering, and interactive team trivia.

---

## 2. Approach and Logic

Event coordination requires balancing deterministic mathematical precision (budgets must equal totals to the exact cent; deadlines must respect local midnights) with generative creativity (vibe themes, color stories, friendly vendor inquiry emails, speech writing).

Planora implements a **dual-engine hybrid architecture**:

```
 ┌──────────────────────────────────────────────────────────────┐
 │                      User Request / State                    │
 └──────────────────────────────┬───────────────────────────────┘
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│    Deterministic Engine     │   │      GenAI Engine (Gemini)  │
│  (Pure Arithmetic & Rules)  │   │   (Creativity & Language)   │
├─────────────────────────────┤   ├─────────────────────────────┤
│ • Budget Line Allocation    │   │ • Multi-model cascade       │
│ • Exact Dollar Normalizer   │   │ • Structured JSON schemas   │
│ • Local-Midnight Countdowns │   │ • Contextual advice drawer  │
│ • Proactive Planner Insights│   │ • Vendor email drafter      │
│ • RFC 4180 CSV Guest Parser │   │ • Speech & invite copy      │
│ • Offline Fallback Pool     │   │ • Ideas across 5 sections   │
└─────────────────────────────┘   └─────────────────────────────┘
               │                                 │
               └────────────────┬────────────────┘
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                 Unified Planora Application State            │
 │            (WCAG 2.1 AA UI • LocalStorage Privacy)           │
 └──────────────────────────────────────────────────────────────┘
```

### Core Architectural Principles:
1. **Server-Side GenAI Planning**: Event parameters (type, vibe, date, venue location, guest headcount, budget cap, and special requests) are processed by Express API endpoints. Google Gemini returns strictly typed JSON schemas (`responseSchema`), returning categorized budget line items, chronological milestones, vendor checklists, and themed ideas.
2. **Deterministic Budget Normalization**: All AI-generated budget items pass through a server-side normalizer (`normalizeBudgetItems`) that enforces exact dollar-for-dollar budget equality with zero penny drift.
3. **Proactive Planner Insights (Rule-Based Decision Making)**: Rather than relying on LLMs for financial risk detection, a deterministic rules engine (`src/utils/plannerInsights.ts`) evaluates real-time event health:
   - **Cash Commitment Buffer**: Warns when uncommitted funds fall below 10% within 45 days of the event.
   - **RSVP Deadline Alerts**: Triggers warnings when deadlines pass with pending RSVPs.
   - **Guest Allergy Safety**: Alerts when guests report dietary restrictions so caterers are notified.
   - **Contingency Drawdown**: Alerts if the emergency fund is depleted early.
   - **Unbooked Vendor Reminders**: Alerts when essential vendor categories lack confirmed bookings.
4. **Offline Fallback Engine**: If no API key is provided, or in the event of provider downtime, the server seamlessly switches to deterministic heuristic generators (`src/utils/fallbackGenerator.ts`, `src/utils/ideaGenerator.ts`), guaranteeing 100% functionality out of the box.
5. **Prompt Security & Delimiter Isolation (Prompt Wars Aligned)**: Untrusted user parameters are strictly isolated inside XML tags (`<event_parameters>`, `<event_context>`, `<user_input>`, `<ideas_focus>`) with delimiter escaping (`esc()`). System instructions explicitly forbid role reversals, instruction overrides, or disclosing internal prompts, keys, or schemas.
6. **Local Midnight & Timezone Arithmetic**: Date countdowns evaluate relative to the user's local calendar midnight, preventing date-shifting across international timezones.

---

## 3. How the Solution Works

Planora guides the user through the complete event lifecycle across 6 dedicated tabs, 5 modals, and a contextual AI assistant:

```
[Create Event Wizard] ──► [Overview Dashboard & Insights]
                                  │
      ┌───────────────┬───────────┼───────────┬───────────────┐
      ▼               ▼           ▼           ▼               ▼
[Budget Tracker] [Timeline]  [Vendors]   [Ideas & Mood]  [Guests & RSVPs]
      │               │           │           │               │
  Auto-Rebalance  5 Phases    Email Draft  5 Sections     CSV Import
```

### 1. AI Planning Wizard Modal (`EventWizardModal.tsx`)
- Three-step modal gathering event title, event type (wedding, birthday, corporate, community, anniversary), date, location, guest headcount, total budget, currency, aesthetic atmosphere (9 distinct vibes), and custom dietary/logistical requests.
- Submits to `/api/ai/generate-plan`, generating an exhaustive plan or using the heuristic fallback generator.

### 2. Overview Dashboard & Planner Insights (`EventOverviewTab.tsx` & `PlannerInsights.tsx`)
- Mission Control displays days-to-go, budget utilization %, confirmed headcount, and unbooked vendors.
- Color palette story with one-click HEX color code copying.
- Proactive insights ranked by severity (Alert, Warning, Info) with actionable guidance.

### 3. Budget Management & Auto-Rebalancer (`BudgetTab.tsx`)
- Visual budget breakdown across categories (Venue, Catering, Decor, Photography, Entertainment, Logistics, Favors, Contingency).
- Tracks allocation vs. actual spent, payment statuses (Paid, Deposit Paid, Unpaid), and uncommitted cash remaining.
- One-click **Auto-Rebalance Budget** tool rescales line items proportionally to maintain the ceiling.

### 4. Timeline & Schedule Coordinator (`TimelineTab.tsx`)
- Chronological milestone tracker spanning 5 event phases:
  1. *Early Planning* (Months out)
  2. *Mid Planning* (Weeks out)
  3. *Final Month* (Confirmations)
  4. *Week-Of* (Rehearsals & Packing)
  5. *Day-Of Schedule* (Minute-by-minute run of show)
- Supports task completion toggles, phase filtering, and person-responsible assignment tags.

### 5. Vendor Directory & Inquiry Email Studio (`VendorsTab.tsx`)
- Tracks quotes, deposit milestones, balance due dates, contact info, and custom action checklists.
- **AI Vendor Inquiry Email Drafter**: Automatically drafts complete, ready-to-send inquiry emails with event context, questions on availability, package pricing, setup timing, and sign-offs.

### 6. Personalized Ideas & Moodboard (`IdeasTab.tsx`)
- Delivers creative concepts across **all 5 sections**:
  1. `Theme & Decor`
  2. `Food & Signature Drinks`
  3. `Entertainment & Games`
  4. `Guest Experience & Keepsakes`
  5. `Eco-Friendly & Zero Waste`
- Written in **simple, friendly everyday language** without complex jargon.
- Filter pills show live category item counts; context-aware Spark button brainstorms across all sections or for a targeted category.

### 7. Guests & RSVPs Coordinator (`GuestsTab.tsx`)
- Tracks confirmed guest headcount (accounting for plus-ones), attending parties, pending responses, and seating assignments.
- Dietary restriction tracking with high-contrast allergy callouts and alert icons.
- **RFC 4180 CSV Import Modal**: Bulk-imports guest lists with live parse previews, column auto-mapping, and duplicate detection.

### 8. Contextual AI Planning Consultant Drawer (`AiAssistantDrawer.tsx`)
- Slide-over assistant drawer aware of the active event's real-time state (title, budget, tasks, vendors, headcount).
- Answers queries with domain advice (e.g. bad weather contingencies, contract checklists, catering cost savings) and provides clickable quick-prompt suggestions.

### 9. Speech & Invite Studio and Export Studio (`SpeechInviteModal.tsx` & `ExportModal.tsx`)
- Generates bespoke invitations and speeches across customizable tones (Warm, Formal, Humorous, Romantic).
- Exports plans to JSON, structured Markdown, or clean printable HTML summaries.

---

## 4. Assumptions Made

1. **Target Users & Scope**: Designed for hosts, families, and coordinators organizing events ranging from intimate gatherings (10 guests) to large festivals (5,000 attendees).
2. **Client-Side Privacy & Persistence**: Event state is stored in browser `localStorage`. No mandatory user accounts, tracking cookies, or remote databases are required; user data remains strictly private on their device.
3. **Resilience & Offline Operation**: An API key is optional. The application guarantees 100% functionality in offline mode with deterministic heuristic fallbacks. When configured with an API key, it connects to Google Gemini with automatic multi-model failover.
4. **Budget as a Hard Ceiling**: Total budget represents an enforced ceiling. All line items generated by AI or heuristics are strictly normalized to ensure exact penny-for-penny equality with zero drift.
5. **Timezone & Locale Integrity**: Event countdowns and deadlines evaluate relative to the user's local calendar midnight, preventing date shifts across international borders.
6. **Multi-Currency Support**: Supports `$`, `€`, `£`, `₹`, `C$`, and `A$` with consistent formatting.
7. **Adversarial Prompt Resistance**: User inputs are treated strictly as untrusted data values to plan around, preventing prompt injection, jailbreaks, or instruction overrides.

---

## 5. Evaluation Focus Areas Alignment

### A. Code Quality — Structure, Readability, Maintainability
- **Decoupled Architecture**: Clear boundary between UI components (`src/components/`), domain math (`src/utils/eventCalculators.ts`), date algorithms (`src/utils/dates.ts`), rules engine (`src/utils/plannerInsights.ts`), and server logic (`src/server/`).
- **Strict TypeScript**: 100% typed codebase with strict typechecking (`npm run lint` passes with 0 errors). Zero `any` casts in production application code.
- **Maintainable Standards**: Comprehensive inline documentation, JSDoc annotations, single-responsibility modules, and clean formatting.

### B. Security — Safe and Responsible Implementation
- **Prompt Injection Defense (Prompt Wars Aligned)**:
  - System prompts clearly delineate developer instructions from untrusted user content.
  - User parameters are wrapped inside isolated XML delimiter tags (`<event_parameters>`, `<event_context>`, `<user_input>`, `<ideas_focus>`) with XML escaping (`esc()`).
  - System instructions explicitly mandate ignoring jailbreaks, role reversals, or requests to reveal internal prompts or keys.
- **Zero Client-Side Secret Leakage**: All Gemini API calls execute strictly on the server (`server.ts`, `geminiClient.ts`). API keys never touch the client.
- **Safe Error Masking**: `sanitizeGeminiErrorMessage` redacts API keys and sensitive tokens (`[REDACTED]`) from logs and error payloads.
- **DoS & Payload Protection**: Express payload body size is capped at `50kb`; `express-rate-limit` enforces 20 req/min per IP on all AI routes.
- **HTTP Security & CSP**: Production Helmet enforces Content-Security-Policy, HSTS, X-Content-Type-Options, and frame restrictions.
- **Zero Dangerous HTML Injection**: React JSX escapes all dynamic text; zero use of `dangerouslySetInnerHTML`.

### C. Efficiency — Optimal Use of Resources
- **Minimal Token Consumption**: AI calls use bounded `maxOutputTokens` and strict `responseSchema` JSON structures, eliminating preamble fluff.
- **Instant Client Computation**: Budget variance, uncommitted cash, timeline progress, insight rules, and guest tallies execute locally in microseconds without network trips.
- **Lightweight Production Bundle**: Built with Vite tree-shaking (~462 kB JS, ~64 kB CSS, gzip total ~128 kB).
- **Fast Resiliency Cascade**: Primary model (`gemini-3-flash-preview`) fails over gracefully to `gemini-3.5-flash`, `gemini-3.1-flash-lite`, and `gemini-3.6-flash` before falling back to instant local heuristics.

### D. Testing — Validation of Functionality
Automated test suite of **137 tests** executed via Node's native test runner (`npm test`):
- **Dates & Midnights (`dates.test.ts`)**: Timezone-safe arithmetic across IST, US Pacific, NZDT, and UTC; DST transitions; leap years.
- **Domain Calculators (`eventCalculators.test.ts`)**: Budget totals, variances, vendor balance tracking, uncommitted cash, plus-one headcount, and auto-rebalancing.
- **Planner Insights (`plannerInsights.test.ts`)**: Cash commitment buffers, RSVP deadlines, allergy warnings, contingency drawdowns, and singular/plural grammar.
- **Offline Chat Fallback (`chatFallback.test.ts`)**: Keyword-driven topic classification, event interpolation, and follow-up suggestions.
- **CSV Guest Parser (`csvGuestParser.test.ts`)**: RFC 4180 parsing with quotes/commas, duplicate detection, and group normalization.
- **Input Validation (`validate.test.ts`)**: Whitelists, string lengths, numeric ranges, and malformed body rejection.
- **Prompt Delimiter Escaping (`promptEscape.test.ts`)**: Tag escaping to prevent delimiter injection breakout.
- **Idea Generation (`ideaGenerator.test.ts`)**: Validates 5 distinct categories with plain English descriptions.
- **Heuristic Plan Generator (`fallbackGenerator.test.ts`)**: 45 combinations (5 types × 9 vibes) guaranteeing exact budget sums.
- **Resiliency & Timeout (`geminiClient.test.ts`, `withTimeout.test.ts`)**: Model failovers, thinking-config stripping, and key redaction.
- **Accessibility (`accessibility.test.tsx`)**: Automated axe-core audits across all 6 tabs, 5 dialogs, and 2 alert dialogs (**0 violations**).

### E. Accessibility — Inclusive and Usable Design (WCAG 2.1 AA)
- **Zero Axe-Core Violations**: All 6 tabs, 5 dialog modals, and 2 alert dialogs achieve **0 axe violations**.
- **Keyboard Navigation & Focus Traps**: Accessible Tab/Shift+Tab focus cycling via `useFocusTrap.ts`, `Escape` key dismissal, and trigger focus restoration.
- **Tab Navigation & History Synchronization**: ARIA `role="tablist"` with arrow key navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`) synced to browser URL hash (`#overview`, `#budget`, `#timeline`, etc.) and `popstate` history.
- **Back-to-Home Navigation**: Prominent breadcrumb navigation, top brand return, and bottom return buttons on every view prevent accidental website closure.
- **Screen Reader Announcements**: Dynamic updates use `aria-live="polite"` and `role="status"`.
- **High Contrast & Focus Rings**: Global `2px solid #818cf8` focus-visible outlines ensure clear keyboard visibility.
- **Reduced Motion**: Disables celebratory confetti when `prefers-reduced-motion` is detected.

### F. Problem Statement Alignment — Relevance to the Stated Problem
Planora directly addresses the end-to-end reality of event coordination. It unites creative inspiration with quantitative rigor, delivering an intuitive, accessible, and resilient planning assistant suitable for any celebration.

---

## 6. How to Run & Verify

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
The app runs 100% offline without an API key. To enable live Gemini AI generation:
```bash
cp .env.example .env
```
Add your Gemini API key in `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-3-flash-preview"
GEMINI_TIMEOUT_MS=30000
PORT=3000
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Tests
```bash
npm test
```
*Expected output: `137 passed, 0 failed, 0 skipped`.*

### 5. Typecheck & Lint
```bash
npm run lint
```
*Expected output: TypeScript check passes with 0 errors.*

### 6. Build Production Bundle
```bash
npm run build
```
*Expected output: Vite build succeeds with ~462 kB production bundle.*
