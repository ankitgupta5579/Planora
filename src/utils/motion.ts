import confetti, { Options } from 'canvas-confetti';

/**
 * Checks if the user prefers reduced motion (WCAG 2.1 compliance).
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Executes confetti only if the user has not requested reduced motion.
 */
export function safeConfetti(options?: Options): void {
  if (shouldReduceMotion()) return;
  try {
    confetti(options);
  } catch {
    // ignore
  }
}
