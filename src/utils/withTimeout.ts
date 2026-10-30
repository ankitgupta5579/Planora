export class TimeoutError extends Error {
  constructor(message = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export function isTimeoutError(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof TimeoutError) return true;
  if (err instanceof Error) {
    return err.name === 'TimeoutError' || /timed out|timeout/i.test(err.message);
  }
  return false;
}

/**
 * Wraps a promise with a timeout limit.
 * If the promise does not settle within `ms` milliseconds,
 * the returned promise rejects with a timeout error.
 *
 * @param promise The promise to execute
 * @param ms Timeout duration in milliseconds (default: 30000)
 * @param timeoutMessage Custom error message on timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms = 30000,
  timeoutMessage = `Operation timed out after ${ms}ms`
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new TimeoutError(timeoutMessage));
    }, ms);
  });

  // Attach a no-op catch handler to prevent unhandled rejection if promise rejects after timeout
  promise.catch(() => {});

  return Promise.race([
    promise.finally(() => {
      if (timer) clearTimeout(timer);
    }),
    timeoutPromise,
  ]);
}
