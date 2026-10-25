import { isAxiosError } from 'axios';

/** Turns any thrown value into a message that is safe to show to a user. */
export function getErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (isAxiosError(err)) {
    if (!err.response) return 'Cannot reach the server. Is the API running?';
    const apiError = err.response.data?.error;
    if (Array.isArray(apiError?.details) && apiError.details.length > 0) {
      return apiError.details
        .map((d: { path?: string; message: string }) => (d.path ? `${d.path}: ${d.message}` : d.message))
        .join('. ');
    }
    if (apiError?.message) return apiError.message;
  }
  return fallback;
}