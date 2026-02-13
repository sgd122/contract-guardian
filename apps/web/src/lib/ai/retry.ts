import { ANALYSIS_TIMEOUT, MAX_RETRIES } from "@cg/shared";

/** Errors that are deterministic and should not be retried */
const NON_RETRYABLE_PATTERNS = [
  "분석 응답이 잘렸습니다",
  "Invalid analysis response schema",
  "Failed to parse AI response as JSON",
];

function isNonRetryableError(error: Error): boolean {
  return NON_RETRYABLE_PATTERNS.some((pattern) =>
    error.message.includes(pattern)
  );
}

/**
 * Shared retry wrapper with timeout for AI provider calls.
 * Automatically skips retries for deterministic failures (truncation, schema errors).
 */
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`${label} timeout`)),
            ANALYSIS_TIMEOUT
          )
        ),
      ]);
      return result;
    } catch (error) {
      lastError = error as Error;

      // Don't retry deterministic failures
      if (isNonRetryableError(lastError)) {
        throw lastError;
      }

      if (attempt < MAX_RETRIES) {
        console.warn(
          `[${label}] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
          lastError.message
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1))
        );
      }
    }
  }

  throw lastError ?? new Error(`${label} failed after retries`);
}
