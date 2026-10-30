export interface ParsedChatReply {
  reply: string;
  suggestions: string[];
}

/**
 * Parses a chat response from Gemini.
 * Attempts standard JSON parsing first.
 * If JSON parsing fails (e.g. from network cutoffs or partial tokens),
 * attempts to salvage only the "reply" text using regex.
 * Always returns { reply: string, suggestions: string[] } with suggestions capped at 4 short strings.
 * Never returns empty reply text; throws if no valid reply can be recovered.
 */
export function parseChatReply(text?: string | null): ParsedChatReply {
  if (!text || !text.trim()) {
    throw new Error('Failed to parse chat response: empty content');
  }

  const raw = text.trim();

  // 1. Standard JSON parse
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const reply = typeof parsed.reply === 'string' ? parsed.reply.trim() : '';
      if (reply.length > 0) {
        const rawSuggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
        const suggestions = rawSuggestions
          .filter((s: unknown): s is string => typeof s === 'string' && s.trim().length > 0)
          .map((s: string) => s.trim().slice(0, 150))
          .slice(0, 4);

        return { reply, suggestions };
      }
    }
  } catch {
    // Fall through to regex salvage on JSON syntax failure
  }

  // 2. Regex salvage for partial or truncated JSON
  let rawReply: string | null = null;
  const structuredMatch = raw.match(/"reply"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"[a-zA-Z0-9_-]+"\s*:|"$)/);
  if (structuredMatch && structuredMatch[1]) {
    rawReply = structuredMatch[1];
  } else {
    const cutoffMatch = raw.match(/"reply"\s*:\s*"([\s\S]*)$/);
    if (cutoffMatch && cutoffMatch[1]) {
      rawReply = cutoffMatch[1].replace(/"$/, '');
    }
  }

  if (rawReply) {
    const salvaged = rawReply
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .trim();

    if (salvaged.length > 0) {
      return {
        reply: salvaged,
        suggestions: [],
      };
    }
  }

  // 3. Otherwise throw a generic error
  throw new Error('Failed to parse chat response');
}
