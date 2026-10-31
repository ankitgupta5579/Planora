<p align="center">
  <img src="public/planora-icon-256.png" alt="Planora logo" width="96" height="96" />
</p>

# Planora — Celebration & Event Planner AI

> **Plan today, celebrate tomorrow.** A smart, dynamic GenAI assistant for milestone celebrations, weddings, birthdays, corporate summits, and community festivals.

[![Live Demo](https://img.shields.io/badge/live%20demo-onrender.com-brightgreen.svg?logo=render)](https://planora-njz8.onrender.com)
[![Test Suite](https://img.shields.io/badge/tests-156%20passed-brightgreen.svg)](#4-testing--validation-of-functionality)
[![WCAG 2.1 AA](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-blue.svg)](#5-accessibility--inclusive-design-wcag-21-aa)
[![Code Quality](https://img.shields.io/badge/code%20quality-ESLint%209%20%2B%20TypeScript-informational.svg)](#1-code-quality--maintainable-architecture)
[![Security Policy](https://img.shields.io/badge/security-hardened%20%2B%20SECURITY.md-success.svg)](SECURITY.md)
[![GitHub Repository](https://img.shields.io/badge/github-ankitgupta5579%2FPlanora-181717.svg?logo=github)](https://github.com/ankitgupta5579/Planora)

- **Live Production URL**: [https://planora-njz8.onrender.com](https://planora-njz8.onrender.com)
- **Public GitHub Repository**: [https://github.com/ankitgupta5579/Planora](https://github.com/ankitgupta5579/Planora)

---

## Architecture Diagram & Folder Structure

Planora is engineered with a modular, domain-driven architecture separating UI presentation, custom hooks, deterministic domain calculators, and hardened server routes:

```
planora/
├── public/                     # Static assets, SVG branding, icons & web manifest
├── src/
│   ├── features/               # Modularized domain features & custom hooks
│   │   ├── app/                # Root app state machine (usePlanoraApp, AppFooter)
│   │   ├── assistant/          # AI chat drawer (useAiChat, ChatMessageItem, Drawer)
│   │   ├── budget/             # Budget tracking, variance & breakdown (useBudget, Cards)
│   │   ├── guests/             # RSVP roster, dietary stats & modal (useGuests, GuestRow)
│   │   ├── ideas/              # Theme moodboard & 5-section touches (useIdeas, IdeaCard)
│   │   ├── overview/           # Mission control hero & metrics (useEventOverview, Cards)
│   │   ├── timeline/           # 5-phase chronological schedule (useTimeline, TimelineCard)
│   │   ├── vendors/            # Directory, financial liabilities & RFPs (useVendors, Cards)
│   │   └── wizard/             # 3-step event creation wizard (useEventWizard, Step1-3)
│   ├── components/             # Core UI components, modals, dialogs & re-exports
│   ├── server/                 # Express backend architecture
│   │   ├── config.ts           # Strict environment parsing & model fallbacks
│   │   ├── geminiClient.ts     # Google GenAI client, retry cascade & error sanitization
│   │   ├── logger.ts           # Structured server logger with automatic secret redaction
│   │   ├── parseChatReply.ts   # Resilient JSON & natural language chat parser
│   │   ├── prompts.ts          # Structured schemas & XML delimiter escaping (esc())
│   │   ├── validate.ts         # Strict request payload validators & boundary checks
│   │   ├── middleware/
│   │   │   ├── rateLimit.ts    # 20 req/min IP rate limiter
│   │   │   └── security.ts     # Helmet CSP, CORS & 50kb payload limits
│   │   └── routes/
│   │       ├── ai.ts           # Modular AI endpoints with resilient fallbacks
│   │       └── health.ts       # Cloud probe health check (GET /api/health)
│   ├── types/                  # Centralized TypeScript domain interfaces
│   └── utils/                  # Deterministic mathematical & business rule engines
│       ├── chatFallback.ts     # Offline keyword-driven conversational engine
│       ├── csvGuestParser.ts   # RFC 4180 compliant CSV guest list parser
│       ├── dates.ts            # Local midnight & international timezone arithmetic
│       ├── eventCalculators.ts # Budget metrics, uncommitted cash & timeline progress
│       ├── fallbackGenerator.ts# Deterministic 45-combination heuristic plan blueprints
│       ├── ideaGenerator.ts    # Plain-English 5-category idea generator
│       ├── motion.ts           # WCAG prefers-reduced-motion animation utilities
│       ├── plannerInsights.ts  # Proactive financial & allergy risk rules engine
│       ├── storage.ts          # LocalStorage persistence with v5 schema migration
│       ├── useFocusTrap.ts     # Accessible modal Tab/Shift+Tab focus cycling
│       └── withTimeout.ts      # Bounded Promise timeout executor
├── server.ts                   # Thin production/development Express entrypoint
├── eslint.config.js            # ESLint 9 flat config (TS-ESLint, React Hooks, JSX A11y)
├── .editorconfig               # Cross-editor formatting consistency
├── .prettierrc                 # Code formatting standards
├── SECURITY.md                 # Threat model, prompt injection defense & policy
└── README.md                   # Complete architectural documentation & verification guide
```

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

1. **AI Planning Wizard Modal (`EventWizardModal.tsx`)**:
   - 3-step modal gathering event title, event type, date, location, guest headcount, total budget, currency, aesthetic atmosphere (9 distinct vibes), and custom dietary/logistical requests.
   - Submits to `/api/ai/generate-plan`, generating an exhaustive plan or using the heuristic fallback generator.
2. **Overview Dashboard & Planner Insights (`EventOverviewTab.tsx` & `PlannerInsights.tsx`)**:
   - Mission Control displays days-to-go, budget utilization %, confirmed headcount, and unbooked vendors.
   - Color palette story with one-click HEX color code copying.
   - Proactive insights ranked by severity (Alert, Warning, Info) with actionable guidance.
3. **Budget Management & Auto-Rebalancer (`BudgetTab.tsx`)**:
   - Visual budget breakdown across categories (Venue, Catering, Decor, Photography, Entertainment, Logistics, Favors, Contingency).
   - Tracks allocation vs. actual spent, payment statuses (Paid, Deposit Paid, Unpaid), and uncommitted cash remaining.
   - One-click **Auto-Rebalance Budget** tool rescales line items proportionally to maintain the ceiling.
4. **Timeline & Schedule Coordinator (`TimelineTab.tsx`)**:
   - Chronological milestone tracker spanning 5 event phases: _Early Planning_, _Mid Planning_, _Final Month_, _Week-Of_, and _Day-Of Schedule_.
   - Supports task completion toggles, phase filtering, and person-responsible assignment tags.
5. **Vendor Directory & Inquiry Email Studio (`VendorsTab.tsx`)**:
   - Tracks quotes, deposit milestones, balance due dates, contact info, and custom action checklists.
   - **AI Vendor Inquiry Email Drafter**: Automatically drafts complete, ready-to-send inquiry emails with event context, questions on availability, package pricing, setup timing, and sign-offs.
6. **Personalized Ideas & Moodboard (`IdeasTab.tsx`)**:
   - Delivers creative concepts across **all 5 sections**: `Theme & Decor`, `Food & Signature Drinks`, `Entertainment & Games`, `Guest Experience & Keepsakes`, and `Eco-Friendly & Zero Waste`.
   - Written in **simple, friendly everyday language** without complex jargon.
7. **Guests & RSVPs Coordinator (`GuestsTab.tsx`)**:
   - Tracks confirmed guest headcount (accounting for plus-ones), attending parties, pending responses, and seating assignments.
   - Dietary restriction tracking with high-contrast allergy callouts and alert icons.
   - **RFC 4180 CSV Import Modal**: Bulk-imports guest lists with live parse previews, column auto-mapping, and duplicate detection.
8. **Contextual AI Planning Consultant Drawer (`AiAssistantDrawer.tsx`)**:
   - Slide-over assistant drawer aware of the active event's real-time state (title, budget, tasks, vendors, headcount).
   - Answers queries with domain advice and provides clickable quick-prompt suggestions.
9. **Speech & Invite Studio and Export Studio (`SpeechInviteModal.tsx` & `ExportModal.tsx`)**:
   - Generates bespoke invitations and speeches across customizable tones.
   - Exports plans to JSON, structured Markdown, or clean printable HTML summaries.

---

## 4. Evaluation Focus Areas Alignment

### 1. Code Quality — Maintainable Architecture

- **Component Modularization**: Large components split into feature folders under `src/features/` with dedicated custom hooks (`useBudget`, `useGuests`, `useVendors`, `useTimeline`, `useIdeas`, `useAiChat`, `usePlanoraApp`) and pure rendering child components.
- **Strict TypeScript & ESLint 9**: 100% typed codebase with strict typechecking, zero production `any` types, ESLint 9 flat config (`typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`), and Prettier formatting.
- **Zero Console In Production**: Production server uses structured logger (`src/server/logger.ts`) with automatic secret redaction.

### 2. Security — Hardened Implementation

- **Prompt Injection Defense**: All user inputs embedded within LLM prompts are isolated inside XML tags and escaped via `esc()` to neutralize delimiter escaping.
- **Zero Client-Side Secret Leakage**: All Gemini interactions run strictly on the server; API keys never touch client code.
- **DoS & Payload Limits**: Express body parser enforces a strict **50kb** body size limit, and `express-rate-limit` caps AI requests at 20 req/min per IP.
- **Production Error Masking**: `applyErrorMiddleware` catches all unhandled exceptions and returns sanitized JSON status codes without stack traces or sensitive environment variables.
- **Full Security Threat Model**: Documented in [`SECURITY.md`](SECURITY.md).
- **Dependency Audit**: `npm audit` confirms 0 high or critical vulnerabilities in runtime production dependencies.

### 3. Efficiency — Optimal Use of Resources

- **Bounded Tokens & Structured Schemas**: All AI calls utilize bounded output tokens and Google GenAI `responseSchema` JSON structures, eliminating preamble token waste.
- **Instant Client Computation**: Financial variance, timeline milestones, insight rules, and guest tallies compute locally in microseconds with 0 network latency.
- **Multi-Model Cascade**: Fast cascade (`gemini-flash-lite-latest` → `gemini-3-flash-preview` → `gemini-3.5-flash` → `gemini-3.1-flash-lite`) delivers live responses in 1–2 seconds.

### 4. Testing — Validation of Functionality

Automated test suite of **156 tests** executed via Node's native test runner (`npm test`):

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
- **Security & Threat Model (`security.test.ts`)**: Verifies 50kb payload limits, CORS headers, Helmet security headers, health endpoint safety, and stack trace masking.
- **API Routes (`aiRoutes.test.ts`, `health.test.ts`)**: End-to-end HTTP endpoint validation for all 5 AI routes and health check.
- **Feature Hooks & State (`features.test.ts`)**: Validates variance logic, phase progress, vendor financials, and guest dietary calculations.
- **Accessibility (`accessibility.test.tsx`)**: Automated axe-core audits across all 6 tabs, 5 dialogs, and 2 alert dialogs (**0 violations**), reduced motion verification, and `aria-live` tests.

### 5. Accessibility — Inclusive Design (WCAG 2.1 AA)

- **Zero Axe-Core Violations**: All 6 tabs, 5 dialog modals, and 2 alert dialogs achieve **0 axe violations**.
- **Keyboard Navigation & Focus Traps**: Accessible Tab/Shift+Tab focus cycling via `useFocusTrap.ts`, `Escape` key dismissal, and trigger focus restoration.
- **Tab Navigation & History Synchronization**: ARIA `role="tablist"` with arrow key navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`) synced to browser URL hash (`#overview`, `#budget`, `#timeline`, etc.) and `popstate` history.
- **Back-to-Home Navigation**: Prominent breadcrumb navigation, top brand return, and bottom return buttons on every view prevent accidental website closure.
- **Screen Reader Announcements**: Dynamic updates use `aria-live="polite"` and `role="status"`.
- **High Contrast & Focus Rings**: Global `2px solid #818cf8` focus-visible outlines ensure clear keyboard visibility.
- **Reduced Motion**: Disables celebratory confetti when `prefers-reduced-motion` is detected.

---

## 5. Scripts Table

| Command                 | Action                                                    |
| ----------------------- | --------------------------------------------------------- |
| `npm run dev`           | Start development server with Vite HMR and Express API    |
| `npm run build`         | Compile optimized production React bundle via Vite        |
| `npm run start`         | Run production Express server serving built client assets |
| `npm test`              | Run complete automated test suite (156 tests)             |
| `npm run test:coverage` | Run tests with Node experimental test coverage reporting  |
| `npm run lint`          | Run TypeScript typechecking and ESLint 9 validation       |
| `npm run lint:types`    | Run `tsc --noEmit` typecheck                              |
| `npm run lint:eslint`   | Run ESLint 9 across all TS/TSX source files               |
| `npm run format`        | Format entire codebase using Prettier                     |
| `npm run format:check`  | Verify code formatting compliance                         |

---

## 6. How to Run Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment (Optional)

Planora runs 100% offline without an API key using built-in heuristic generators. To connect to live Google Gemini AI:

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

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Tests & Coverage

```bash
npm test
npm run test:coverage
```

### 5. Build for Production

```bash
npm run build
npm start
```

---

## License

MIT License. Designed and engineered for the Hack2Skill Prompt Wars Challenge.
