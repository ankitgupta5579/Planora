export type FallbackReason = 'no-api-key' | 'timeout' | 'error';

/**
 * Returns user-facing friendly guidance explaining why an offline fallback response
 * is being displayed.
 *
 * @param reason The reason for the offline fallback ('timeout' | 'no-api-key' | 'error')
 */
export function getFallbackMessage(reason?: FallbackReason | null): string {
  switch (reason) {
    case 'timeout':
      return 'The assistant took too long, so this is an offline answer.';
    case 'no-api-key':
      return 'Offline mode: add an API key for live Planora AI replies.';
    case 'error':
      return 'The assistant is unavailable right now, so this is an offline answer.';
    default:
      return '';
  }
}
