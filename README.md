# Celebration & Event Planner AI

A full-stack celebration and event planning application powered by Google Gemini and TypeScript. It assists organizers in coordinating weddings, birthdays, community gatherings, and corporate events with automated budget allocation, timeline management, vendor checklists, and guest coordination.

The app works without an API key using an offline fallback planner.

---

## Chosen Vertical
Celebration & Event Planner — Designed for individual hosts, families, and community coordinators planning milestone events including weddings, birthday parties, anniversaries, corporate gatherings, and community festivals.

---

## Approach and Logic
Event coordination requires synchronizing budgets, milestones, vendors, and communications. This solution implements a dual-engine architecture:

1. **Server-Side GenAI Planning**: Event parameters (type, vibe, date, venue location, guest headcount, budget cap, and notes) are sent to an Express API endpoint. When configured, Google Gemini (`gemini-3.8-flash`) generates structured plans enforced by strict JSON schemas (`responseSchema`), returning categorized budget line items, chronological milestones, vendor checklists, and themed ideas.
2. **Offline Fallback Engine**: If no API key is configured or an external API failure occurs, the server seamlessly falls back to a deterministic heuristic generator (`src/utils/fallbackGenerator.ts`). Every supported event type generates a complete plan, and budget line items always sum exactly to the specified total.
3. **Pure Arithmetic Modules**: Budget calculations, percentage utilization, timeline progress, vendor balances, and RSVP guest tallies are implemented as decoupled utility functions (`src/utils/eventCalculators.ts`).
4. **Adaptive Budget Rebalancing**: If expenses exceed allocated amounts, an in-memory rebalancing algorithm rescales line items proportionally to maintain the target ceiling.

---

## How It Works
- **Overview Dashboard**: Displays event countdowns, budget utilization meters, milestone progress bars, RSVP counts, and a color palette story.
- **Budget Tracker**: Tracks categorized line items, payment statuses, variance, and includes a one-click auto-rebalance tool.
- **Timeline & Schedule**: Organizes milestones across five phases (Early Planning, Mid Planning, Final Month, Week Of, and Day-Of Schedule) with status toggling and assignee tags.
- **Vendor Directory**: Tracks vendor quotes, deposits, outstanding balances, custom action checklists, and generates tailored inquiry email drafts.
- **Ideas & Moodboard**: Categorizes creative concepts across Theme & Decor, Food & Beverages, Entertainment, Guest Experience, and Eco-Friendly Tips.
- **Guests & RSVPs**: Manages guest lists, plus-ones, meal requirements, and dietary restrictions (vegetarian, vegan, gluten-free).
- **AI Planning Consultant**: Context-aware slide-over assistant drawer providing tailored planning suggestions and advice.
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
GEMINI_MODEL="gemini-3.8-flash"
GEMINI_TIMEOUT_MS=30000
PORT=3000
```

- `GEMINI_MODEL`: Model name (default: `gemini-3.8-flash`; alternative high-availability Flash models such as `gemini-3.5-flash` or `gemini-3.5-flash-lite` are also supported).
- `GEMINI_TIMEOUT_MS`: Timeout for Gemini API calls in milliseconds (default: `30000` / 30s). Client aborts are configured to wait 5 seconds longer (`35000`ms) to allow graceful fallback handling.

### 3. Start Development Server
```bash
npm run dev
```
The server starts on `http://localhost:3000`.

### 4. Run Unit Tests
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
- **Server-Side API Execution**: Gemini API calls are executed strictly on the server (`server.ts`). API keys are never passed to the client.
- **Payload Boundaries**: `express.json` enforces a strict `50kb` body limit to protect against oversized payload attacks.
- **Content-Security-Policy (CSP)**: In production, helmet enforces a strict CSP restricting scripts, connections, and default sources to `'self'`, styles to `'self'`, `'unsafe-inline'`, and Google Fonts (`https://fonts.googleapis.com`), and fonts to `'self'`, `data:`, and Google Fonts (`https://fonts.gstatic.com`). CSP is disabled in dev mode to support Vite HMR/eval.
- **Security Headers**: `helmet` is configured to set standard security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.).
- **Rate Limiting**: `express-rate-limit` enforces a ceiling of 20 requests per minute per IP address across all `/api/ai/*` routes.
- **Input Validation**: All incoming API requests are validated via whitelist and boundary checks (`src/server/validate.ts`). String lengths are capped (title <= 100, text <= 500, message <= 1000), guest counts are bounded (1 to 5000), and budgets must be positive numbers. Invalid inputs are rejected with HTTP 400.
- **Safe Error Masking**: Internal error stacks and provider error messages are logged server-side only; clients receive generic, non-leaking error responses.

---

## Testing

The project maintains a comprehensive, zero-flake test suite executed via Node's native test runner (`tsx --test`). Tests run across unit, integration, server, and automated accessibility layers:

- **Event & Budget Calculators (`src/utils/eventCalculators.test.ts`)**: Verifies accurate financial aggregation, budget utilization percentages, variance calculation, timeline phase progress, guest count tallies with plus-ones and dietary restrictions, date countdown arithmetic, and proportional budget rebalancing.
- **Input Validation & Sanitization (`src/server/validate.test.ts`)**: Enforces whitelist constraints, string length limits, numeric range bounds, and whitelisted event types for plan generation, chat queries, speech generation, and vendor inquiries.
- **Offline Heuristic Fallback Generator (`src/utils/fallbackGenerator.test.ts`)**: Confirms deterministic, complete plan generation across all supported event types (wedding, birthday, community, corporate) and vibes, guaranteeing exact budget item sums.
- **Promise Timeout Helper (`src/utils/withTimeout.test.ts`)**: Validates that `withTimeout` resolves when the underlying promise finishes in time, rejects with a `TimeoutError` when the duration is exceeded, handles underlying rejections cleanly, and honors default parameters.
- **Fallback Reason Mapping (`src/utils/fallbackMessages.test.ts`)**: Tests the mapping of fallback reasons (`timeout`, `no-api-key`, `error`) to friendly user-facing messages.
- **Client-Side Storage Resilience (`src/utils/storage.test.ts`)**: Tests that corrupted, malformed, or empty `localStorage` safely falls back to sample events without crashing, and that custom saved events accurately round-trip through `saveAllEvents` and `loadSavedEvents`.
- **Server API & Fallback Paths (`src/server/serverFallback.test.ts`)**: Spins up an ephemeral server instance to test all four AI endpoints without an API key, asserting HTTP 200 with `isFallback: true` and `fallbackReason: 'no-api-key'`, as well as rejecting invalid inputs with HTTP 400 and oversized payloads with HTTP 413.
- **Automated Accessibility with axe-core & JSDOM (`src/components/accessibility.test.tsx`)**: Renders all 6 application tabs (Overview, Budget, Timeline, Vendors, Ideas, Guests) and all 4 dialog modals (Wizard, AI Assistant Drawer, Export, Speech/Invite) in a JSDOM environment, asserting **ZERO** axe violations (WCAG 2.1 AA/A). Also validates that every dialog declares `role="dialog"`, moves focus inside on open, and closes cleanly upon pressing `Escape`.

### Exact Verification Commands
```bash
# Run the full automated test suite (48 tests)
npm test

# Run TypeScript static typecheck
npm run lint

# Run production Vite bundle
npm run build
```

---

## Accessibility Notes (WCAG 2.1 AA)

### Verified Automatically in Test Suite (`npm test`)
- **Axe-core Audit**: All 6 tabs (Overview, Budget, Timeline, Vendors, Ideas, Guests) and all 4 dialogs (Wizard modal, AI assistant drawer, Export modal, Speech/Invite modal) pass automated axe-core accessibility checks with **zero violations**.
- **Dialog & Focus Traps**: All modals and the slide-over AI drawer implement `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, trap Tab/Shift+Tab focus cycling, close on `Escape`, and restore focus to the trigger element on close (`src/utils/useFocusTrap.ts`).
- **Tab Navigation**: Main tabs use `role="tablist"`, `role="tab"`, and `role="tabpanel"` with keyboard arrow navigation (`ArrowRight`, `ArrowLeft`, `Home`, `End`).
- **Skip Link**: A "Skip to main content" anchor is available as the first focusable element.
- **Form Controls & Labels**: All inputs, selects, and textareas include associated `<label htmlFor>` tags or `aria-label` attributes.
- **Live Status Regions**: Dynamic updates (AI responses, budget alerts, generation loading status) declare `aria-live="polite"` and `role="status"`.
- **Icon Buttons**: All icon-only buttons include descriptive `aria-label` values.
- **High-Contrast Focus Indicators**: Global `:focus-visible` outlines (`2px solid #818cf8`) ensure clear keyboard focus throughout.
- **Font Sizing**: All informative labels and body text meet a minimum threshold of 12px (`text-xs`).
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce` by disabling confetti animations and transition durations (`src/utils/motion.ts`).

### Manual Accessibility Verification Recommended
While axe-core and automated DOM tests verify structural semantics, keyboard hooks, and ARIA roles, the following aspects require manual checking in real browser/assistive technology environments:
1. **Screen Reader Experience**: Manual walkthroughs using NVDA/JAWS (Windows) or VoiceOver (macOS/iOS) to verify announcement clarity, pronunciation, and flow of live announcements.
2. **Lighthouse Audit**: Browser-based Google Lighthouse accessibility audit in Chrome DevTools to verify real rendered DOM color contrast calculations under specific client display scale factors and GPU rendering modes.
3. **Zoom & High Contrast Modes**: Visual verification at 200% browser zoom and under Windows High Contrast Mode (Contrast Themes) to ensure no content clippings or text overlaps occur.

---

## Assumptions
1. **Currency**: Defaults to USD (`$`), with support for EUR (`€`), GBP (`£`), INR (`₹`), CAD (`C$`), and AUD (`A$`).
2. **Persistence**: Client-side state is stored in browser `localStorage`.
3. **Resilience**: The app works without an API key using an offline fallback planner.
