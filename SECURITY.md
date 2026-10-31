# Planora Security Policy & Threat Model

## Overview

Security is a foundational tenet of Planora. As an AI-powered celebration and event planning platform, Planora processes user input, orchestrates generative AI planning blueprints, and delivers structured schedules, budgets, vendor checklists, and guest rosters.

This document outlines our security architecture, threat model, mitigation strategies, and vulnerability reporting procedures.

---

## Threat Model & Mitigations

### 1. Prompt Injection & Jailbreak Prevention

- **Threat**: Malicious actors inputting crafted prompts into event titles, special requests, vendor queries, or chat inputs attempting to override Gemini system instructions, bypass formatting schemas, or leak instructions.
- **Mitigations**:
  - **Delimiter Isolation & Escaping**: All user-supplied inputs embedded within LLM prompts are wrapped in explicit XML delimiter tags (`<user_input>`, `<event_parameters>`, `<event_context>`) and passed through an HTML entity escaper (`esc()`) that converts `<` and `>` to `&lt;` and `&gt;`. This prevents attackers from closing delimiter blocks.
  - **Structured JSON Output Schemas**: All generative completions use rigid Google GenAI JSON schemas (`responseSchema`) with exact typed fields, neutralizing free-form output hijacking.
  - **Length & Character Boundaries**: Inputs are strictly capped (event titles: max 100 chars, special requests: max 500 chars, chat: max 1,000 chars, vendor queries: max 300 chars).

### 2. Denial of Service (DoS) & Resource Exhaustion

- **Threat**: Automated scripts spamming endpoints with heavy payloads or high-frequency requests to exhaust Gemini quotas or server memory.
- **Mitigations**:
  - **Payload Size Capping**: Express JSON body parser strictly enforces a **50kb** maximum body size limit. Larger bodies are immediately rejected with `413 Payload Too Large`.
  - **IP Rate Limiting**: AI routes are protected by `express-rate-limit` allowing at most 20 requests per minute per IP address.
  - **Client & Server Timeouts**: Live model requests are bounded by a 30-second server timeout (`withTimeout`) and a 15-second client abort controller (`CLIENT_CHAT_TIMEOUT_MS`).
  - **Instant Heuristic Fallbacks**: If rate limits or timeouts are reached, Planora instantly switches to offline deterministic generators with zero service downtime.

### 3. Secret Management & Information Leakage

- **Threat**: Exposure of `GEMINI_API_KEY`, environment variables, internal server paths, or stack traces in API responses or logs.
- **Mitigations**:
  - **Zero Secret Exposure**: The frontend client never touches API keys; all AI interactions are proxied through the Express backend.
  - **Sanitized Structured Logger**: The server logger (`src/server/logger.ts`) intercepts log messages and automatically redacts Google API key patterns (`AIza...`) and sensitive tokens.
  - **Production Error Masking**: Unhandled exceptions and errors are caught by `applyErrorMiddleware`. Clients receive clean generic status codes (`400`, `413`, `500`) with no stack traces or internal implementation details.

### 4. Cross-Site Scripting (XSS) & Content Injection

- **Threat**: Rendering user-generated or AI-generated Markdown/HTML strings resulting in script execution.
- **Mitigations**:
  - **No `dangerouslySetInnerHTML`**: React 19 safe rendering is enforced across all components. Text formatting (such as bolding) uses pure AST string splitting without raw HTML injection.
  - **Strict Content Security Policy (CSP)**: In production, Helmet enforces strict CSP headers restricting scripts to `'self'`, blocking inline script execution, and restricting font/image origins.
  - **Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Cross-Origin-Resource-Policy` are enforced on all HTTP responses.

### 5. Cross-Origin Resource Sharing (CORS)

- **Threat**: Unauthorized origins invoking internal AI endpoints on behalf of unsuspecting users.
- **Mitigations**:
  - Same-origin is required by default. Cross-origin requests are verified against allowed production domains (`https://planora-njz8.onrender.com`).
  - Preflight `OPTIONS` requests receive standard `204 No Content` responses with validated headers.

---

## Dependency & Supply Chain Security

- Automated vulnerability scanning is performed via `npm audit`.
- Zero runtime high-severity or critical vulnerabilities exist in production dependencies.
- All production dependencies are pinned to stable semver ranges.

---

## Reporting a Vulnerability

If you discover a security vulnerability in Planora, please report it responsibly:

1. **Email**: Open a private disclosure or email the maintainer at `ankitgupta5579@gmail.com`.
2. **Do Not File Public Issues**: Please avoid filing public GitHub issues for security vulnerabilities until a patch has been verified and released.
3. **Response SLA**: We acknowledge receipt of security reports within 24 hours and aim to release patches within 72 hours.
