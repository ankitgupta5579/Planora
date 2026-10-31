<p align="center">
  <img src="public/planora-icon-256.png" alt="Planora logo" width="96" height="96" />
</p>

# Planora

> **Plan today, celebrate tomorrow.** A GenAI-powered planning assistant for weddings, birthdays and community events.

A full-stack celebration and event planning application built with React, TypeScript, Express, and Google Gemini. It coordinates weddings, birthdays, community gatherings, and corporate events with budget allocation, timeline management, vendor checklists, and guest coordination.

The app works without an API key using an offline fallback planner.

---

## Chosen Vertical
Planora (a celebration & event planner) — Designed for individual hosts, families, and community coordinators planning milestone events including weddings, birthday parties, anniversaries, corporate gatherings, and community festivals.

---

## Approach and Logic
Event coordination requires synchronizing budgets, milestones, vendors, and communications. This solution implements a dual-engine architecture:

1. **Server-Side GenAI Planning**: Event parameters (type, vibe, date, venue location, guest headcount, budget cap, and notes) are sent to an Express API endpoint. When configured, Google Gemini generates structured plans enforced by JSON schemas (`responseSchema`), returning categorized budget line items, chronological milestones, vendor checklists, and themed ideas. All AI-generated budget items pass through a server-side budget normalizer (`normalizeBudgetItems`) to enforce exact dollar-for-dollar budget equality with zero drift.
2. **Offline Fallback Engine**: If no API key is configured or an external API failure occurs, the server falls back to a deterministic heuristic generator (`src/utils/fallbackGenerator.ts`). Every supported event type and vibe generates a complete plan, and budget line items always sum exactly to the specified total.
3. **Pure Arithmetic Modules**: Budget calculations, percentage utilization, timeline progress, vendor balances, and RSVP guest tallies are implemented as decoupled utility functions (`src/utils/eventCalculators.ts`).
4. **Adaptive Budget Rebalancing**: If expenses exceed allocated amounts, an in-memory rebalancing algorithm rescales line items proportionally to maintain the target ceiling.

---

## AI Models and Fallback Strategy

- **Default Model**: `gemini-3-flash-preview`
- **Fallback Models (`FALLBACK_MODELS`)**:
  1. `gemini-3-flash-preview`
  2. `gemini-3.5-flash`
  3. `gemini-3.1-flash-lite`
  4. `gemini-3.6-flash`
- **Multi-Model Resiliency**:
  - The server first calls the configured model (`GEMINI_MODEL`, defaulting to `gemini-3-flash-preview`).
  - If rejected with HTTP 400 mentioning `thinking`, it retries once without `thinkingConfig`.
  - If the model returns HTTP 404 (model deprecated/sunset), HTTP 503 (high demand spike), or HTTP 429 (per-model rate limit/quota exhausted), the server automatically tries the fallback models in `FALLBACK_MODELS` in sequential order (skipping the failed model and stripping `thinkingConfig`).
  - If all models fail or the network times out, the server falls back to the deterministic offline planner (`fallbackReason: 'no-api-key' | 'timeout' | 'error'`).
  - Note: Preview models can change over time; setting `GEMINI_MODEL` in `.env` overrides the default for any active model. If a deprecated model (such as `gemini-2.0-flash` or `gemini-2.5-flash`) is provided in `.env`, the server automatically remaps it to `gemini-3-flash-preview`.

---

## How It Works
- **Overview Dashboard & Planner Insights**: Displays local-midnight event countdowns, proactive deterministic recommendations (cash commitment buffers, RSVP deadline alerts, guest allergy safety notices, budget pacing, contingency drawdown, unbooked vendor alerts, RSVP lags), mission control metric cards, and a color palette story.
- **Budget Tracker**: Tracks categorized line items, payment statuses (Paid, Deposit Paid, Unpaid), precise variance semantics ("Balance due $X" with clock icon for partial items, "Under by $X" only for fully paid items, "Over by $X", "On target"), uncommitted cash KPIs after outstanding vendor commitments, and includes a one-click auto-rebalance tool.
- **Timeline & Schedule**: Organizes milestones across five phases (Early Planning, Mid Planning, Final Month, Week Of, and Day-Of Schedule) with status toggling and assignee tags.
- **Vendor Directory**: Tracks vendor quotes, deposits, outstanding balances, custom action checklists, human-cased status badges, and generates tailored inquiry email drafts.
- **Ideas & Moodboard**: AI-powered structured multi-card idea generator returning 3 distinct cards with category badges, tag pills, and accessible Show more / Show less expansion toggles.
- **Guests & RSVPs**: Manages guest lists, confirmed headcount (people) with plus-ones, parties attending, pending RSVPs, dietary needs with distinct AA-compliant allergy callouts and alert icons, inline seat/table assignment, and accessible CSV bulk import with live parse previews and duplicate detection.
- **AI Planning Consultant**: Context-aware slide-over assistant drawer providing tailored planning suggestions and advice. Shows no fallback notice during live responses, and displays clear offline indicators on fallbacks.
- **Invites & Speeches Studio**: Generates customizable invitation text and speeches across multiple tones.
- **Export Studio**: Exports event plans as JSON, formatted Markdown, or printable summaries.

---

## How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
The application functions without an API key using the built-in offline fallback planner. To enable live Gemini AI generation:
```bash
cp .env.example .env
```
Set your credentials in `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-3-flash-preview"
GEMINI_TIMEOUT_MS=30000
PORT=3000
```

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key from AI Studio | _none (offline mode)_ |
| `GEMINI_MODEL` | Gemini model name | `gemini-3-flash-preview` |
| `GEMINI_TIMEOUT_MS` | External request timeout limit in milliseconds | `30000` |
| `PORT` | Local server port | `3000` |

### 3. Start Development Server
```bash
npm run dev
```
The server starts on `http://localhost:3000`.

### 4. Run Tests
```bash
npm test
```

### 5. Typecheck & Lint
```bash
npm run lint
```

### 6. Production Build
```bash
npm run build
```

---

## Security Notes
- **Server-Side API Execution**: Gemini API calls are executed strictly on the server (`server.ts` and `src/server/geminiClient.ts`). API keys are never passed to the client.
- **Payload Boundaries**: `express.json` enforces a strict `50kb` body limit to protect against oversized payload attacks.
- **Content-Security-Policy (CSP)**: In production, helmet enforces a strict CSP restricting scripts, connections, and default sources to `'self'`, styles to `'self'`, `'unsafe-inline'`, and Google Fonts (`https://fonts.googleapis.com`), and fonts to `'self'`, `data:`, and Google Fonts (`https://fonts.gstatic.com`). CSP is disabled in dev mode to support Vite HMR/eval.
- **Security Headers**: `helmet` is configured to set standard security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.).
- **Reverse Proxy & Rate Limiting**: `express.set('trust proxy', 1)` (configurable via `TRUST_PROXY`) ensures reverse proxies (Cloud Run, Render, Heroku, Nginx) pass client IPs through `X-Forwarded-For`, preventing shared-IP rate limiting collisions. `express-rate-limit` enforces a ceiling of 20 requests per minute per IP address across all `/api/ai/*` routes.
- **Anti-Prompt-Injection Delimiters**: User text (titles, messages, special requests, vendor notes) is wrapped in structured XML tags (`<user_input>`, `<event_parameters>`, `<event_context>`, `<vendor_details>`) alongside explicit system instructions treating content strictly as passive data and forbidding instruction overrides.
- **Input Validation**: All incoming API requests are validated via whitelist and boundary checks (`src/server/validate.ts`). String lengths are capped (title <= 100, text <= 500, message <= 1000), guest counts are bounded (1 to 5000), and budgets must be positive numbers. Invalid inputs are rejected with HTTP 400.
- **Safe Error Masking**: Internal error stacks and provider error messages are sanitized before logging; query strings and headers with API keys are redacted (`[REDACTED]`). Clients receive non-leaking fallback responses.

---

## Testing

The project maintains an automated test suite of 133 tests executed via Node's native test runner (`npm test`). Tests cover:

- **Local Midnight & Timezone Dates (`src/utils/dates.test.ts`)**: Timezone-safe date arithmetic comparing local midnights across IST (`Asia/Kolkata`), US Pacific (`America/Los_Angeles`), NZDT (`Pacific/Auckland`), and UTC, DST transitions, leap years, and calendar round-tripping.
- **Event & Budget Calculators (`src/utils/eventCalculators.test.ts`)**: Financial aggregation, budget utilization percentages, variance calculation with deposit-paid balance-due semantics, uncommitted cash calculation with vendor balances, timeline phase progress, guest count tallies with plus-ones and dietary restrictions (filtering out "None"), and proportional budget rebalancing.
- **Planner Insights Engine (`src/utils/plannerInsights.test.ts`)**: Deterministic rules covering cash commitment buffer (<10% & <=45 days), passed RSVP deadlines with pending guests, caterer allergy safety warnings, budget pace warnings, over-allocation vs under-allocation, early contingency drawdowns, RSVP pace lags, unbooked vendor warnings with proper singular/plural grammar, day-of run of show checks, post-event balances, severity sorting, and insight capping.
- **Keyword-Aware Offline Chat Fallback (`src/utils/chatFallback.test.ts`)**: Deterministic topic classification across weather, catering, venue contracts, icebreakers, timeline, budget, vendors, guests, decor, and entertainment; contextual event data interpolation and relevant follow-up suggestions in offline mode.
- **Client-Side CSV Guest Parser (`src/utils/csvGuestParser.test.ts`)**: RFC 4180 parsing with embedded commas, quotes, and escaped quotes, case-insensitive header mapping, group and RSVP normalization, duplicate detection against existing guest lists, and error isolation.
- **Input Validation & Sanitization (`src/server/validate.test.ts`)**: Whitelist constraints, string length limits, numeric range bounds, and whitelisted event types for plan generation, ideas generation, chat queries, speech generation, and vendor inquiries.
- **Anti-Prompt-Injection Escaping (`src/server/promptEscape.test.ts`)**: Validates HTML/XML tag escaping (`esc()`) across all prompt builders, verifying user inputs cannot break out of tagged prompt delimiters.
- **Structured Idea Generation (`src/utils/ideaGenerator.test.ts`)**: Deterministic multi-card idea heuristics returning 3 bespoke cards per event type and vibe with human titles.
- **Offline Heuristic Fallback Generator (`src/utils/fallbackGenerator.test.ts`)**: Deterministic, complete plan generation across all 5 supported event types and all 9 aesthetic vibes (45 combinations), guaranteeing exact budget item sums and edge-value handling.
- **Promise Timeout Helper (`src/utils/withTimeout.test.ts`)**: Resolves when promises finish in time, rejects with `TimeoutError` when durations are exceeded, handles underlying rejections, and honors defaults.
- **Gemini Client Resiliency (`src/server/geminiClient.test.ts`)**: Mocked tests covering primary model success, timeouts, HTTP 400 thinking retry without `thinkingConfig`, HTTP 404 model deprecation with second fallback recovery, HTTP 503 high-demand recovery, HTTP 429 quota recovery, failed model skipping, thinkingConfig stripping on fallbacks, exhausted fallback errors, and error message credential sanitization.
- **Chat Response Parsing & Recovery (`src/server/parseChatReply.test.ts`)**: Valid JSON extraction, regex salvage on truncated JSON, garbage input rejection, empty input rejection, and suggestion capping at 4 items.
- **Fallback Reason Mapping (`src/utils/fallbackMessages.test.ts`)**: Mapping fallback reasons (`timeout`, `no-api-key`, `error`) to user-facing messages, asserting no notice is prepended when `isFallback: false`, and verifying fallback notices when `isFallback: true`.
- **Client-Side Storage Resilience (`src/utils/storage.test.ts`)**: Corrupted, malformed, or empty `localStorage` fallback to sample events, and round-tripping through `saveAllEvents` and `loadSavedEvents`.
- **Server API & Fallback Paths (`src/server/serverFallback.test.ts`)**: Ephemeral server instance testing all AI endpoints without an API key (HTTP 200 with `isFallback: true` and `fallbackReason: 'no-api-key'`), input rejection (HTTP 400), payload limits (HTTP 413), retry without thinkingConfig, and AI-success path mapping with server-side budget normalization.
- **Component Behavior (`src/components/componentBehavior.test.tsx`)**: Validates DOM rendering, calculations, and data presentation for EventOverviewTab, BudgetTab, GuestsTab, TimelineTab, VendorsTab, and multi-card IdeasTab.
- **Automated Accessibility with axe-core & JSDOM (`src/components/accessibility.test.tsx`)**: Renders all 6 application tabs (Overview, Budget, Timeline, Vendors, Ideas, Guests), standalone PlannerInsights, and all 5 dialog modals (Wizard, AI Assistant Drawer, Export, Speech/Invite, CSV Import) in a JSDOM environment, asserting **ZERO** axe violations (WCAG 2.1 AA/A). Validates `role="dialog"`, focus containment, and `Escape` key dismissal.

### Test Execution Commands
```bash
# Run the full automated test suite
npm test

# Run TypeScript static typecheck
npm run lint

# Run production Vite bundle
npm run build
```

---

## Accessibility Notes (WCAG 2.1 AA)

### Verified Automatically in Test Suite (`npm test`)
- **Axe-core Audit**: All 6 tabs and all 4 dialogs pass automated axe-core accessibility checks with zero violations.
- **Dialog & Focus Traps**: Modals and the slide-over AI drawer implement `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, trap Tab/Shift+Tab focus cycling, close on `Escape`, and restore focus to trigger elements (`src/utils/useFocusTrap.ts`).
- **Tab Navigation**: Main tabs use `role="tablist"`, `role="tab"`, and `role="tabpanel"` with keyboard arrow navigation (`ArrowRight`, `ArrowLeft`, `Home`, `End`).
- **Skip Link**: A "Skip to main content" anchor is available as the first focusable element.
- **Form Controls & Labels**: Inputs, selects, and textareas include associated `<label htmlFor>` tags or `aria-label` attributes.
- **Live Status Regions**: Dynamic updates declare `aria-live="polite"` and `role="status"`.
- **High-Contrast Focus Indicators**: Global `:focus-visible` outlines (`2px solid #818cf8`) ensure clear keyboard focus throughout.
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce` by disabling confetti animations and transition durations (`src/utils/motion.ts`).

### Manual Checks
The following manual verification passes should be performed in target browser environments:
1. **Live Gemini Reply**: Verify end-to-end generation and contextual drawer recommendations with a live API key.
2. **Lighthouse Accessibility Audit**: Run Google Lighthouse in Chrome DevTools on the production build to inspect real-browser color contrast and layout rendering.
3. **Screen Reader Pass**: Walk through the application with NVDA/JAWS on Windows or VoiceOver on macOS to confirm auditory announcement clarity and navigation flow.

---

## Challenge Expectations & Evaluation Focus Alignment

### 1. Challenge Expectations
| Expectation | Implementation in Planora |
|---|---|
| **Smart, Dynamic Assistant** | Context-aware AI Planning Consultant drawer, multi-model fallback cascade (`gemini-3-flash-preview` → `gemini-3.5-flash` → `gemini-3.1-flash-lite` → `gemini-3.6-flash`), structured JSON generation schemas, tailored vendor inquiry drafters, and custom speech/invite generators. |
| **Logical Decision Making Based on User Context** | Deterministic Planner Insights engine proactively evaluating real-time plan state: cash commitment buffers (<10% uncommitted with ≤45 days), RSVP deadline alerts, caterer allergy safety warnings, budget pacing, contingency drawdowns, and unbooked vendor reminders. |
| **Practical & Real-World Usability** | Comprehensive event management across 6 purpose-built tabs (Overview, Budget, Timeline, Vendors, Ideas, Guests), CSV bulk guest import with live duplicate detection, one-click budget auto-rebalancing, and multi-format export (JSON, Markdown, Print). Works 100% out of the box with or without an API key. |
| **Clean & Maintainable Code** | Decoupled domain calculators (`src/utils/eventCalculators.ts`), centralized validation (`src/server/validate.ts`), reusable accessibility hooks (`useFocusTrap.ts`), zero `any` types in production code, and comprehensive modular architecture. |

### 2. Evaluation Focus Areas
- **Code Quality**: Clean separation of concerns between presentation, domain arithmetic, server routing, and LLM integrations. Strongly typed TypeScript passing strict typechecking (`npm run lint`).
- **Security**:
  - Zero client-side API key leakage (all Gemini requests are proxied server-side).
  - Strict Content-Security-Policy (CSP) in production and standard HTTP security headers via Helmet.
  - Request payload size limited to `50kb` to protect against DoS.
  - Rate limiting enforced on all AI endpoints (20 req/min per IP) with reverse proxy trust (`X-Forwarded-For`).
  - Structured XML prompt injection isolation boundaries (`<user_input>`, `<event_parameters>`) and system prompt defense guards.
  - Strict input validation whitelists and bounds checking on every endpoint.
  - Automatic credential and sensitive data sanitization (`[REDACTED]`) in server logging.
- **Efficiency**:
  - Token consumption minimized using `ThinkingLevel.MINIMAL` and strict `responseSchema` specifications.
  - Zero unnecessary LLM calls: pure arithmetic, budget aggregations, timeline progress, and insights are computed locally in microseconds.
  - Production Vite bundle optimized with tree-shaking (~118 kB gzipped JS).
- **Testing**:
  - 133 automated unit, integration, and accessibility tests executed via Node's native test runner (`npm test`).
  - Covers date arithmetic, budget math, planner insights, offline chat fallbacks, CSV parsing, API route validation, prompt escaping, timeout resilience, and Gemini error recovery.
- **Accessibility (WCAG 2.1 AA)**:
  - Zero Axe-core violations across all 6 tabs, insights, and 5 modal dialogs.
  - Focus trapping with `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `Escape` key dismissal.
  - Keyboard navigation (`ArrowRight`, `ArrowLeft`, `Home`, `End`) on tablists, "Skip to main content" link, screen-reader live announcements (`aria-live="polite"`), and high-contrast `:focus-visible` rings.
- **Problem Statement Alignment**:
  - Built specifically as a GenAI-powered celebration and event planning assistant tailored for milestone life events (weddings, birthdays, anniversaries, community festivals).

---

## Assumptions
1. **Target Users & Event Scope**: Designed for individual hosts, families, and community coordinators planning milestone events with up to 5,000 attendees and customizable budgets.
2. **Privacy & Client-Side Persistence**: Event data is stored in the browser's `localStorage` for complete user privacy and offline availability, requiring no account creation or external database.
3. **Resilience & Offline Operation**: The application functions without an API key using deterministic heuristic fallback generation. If an API key is provided, it connects to Google Gemini with automatic multi-model fallback resiliency.
4. **Budget Integrity**: The total budget represents an enforced ceiling. All AI-generated and heuristic line items are normalized to ensure exact penny-for-penny budget allocation with zero drift.
5. **Timezone & Locale**: Event dates and countdowns evaluate relative to the host's local midnight and system timezone, preventing date-shifting across international borders.
6. **Currency Support**: Defaults to USD (`$`), with support for EUR (`€`), GBP (`£`), INR (`₹`), CAD (`C$`), and AUD (`A$`).
