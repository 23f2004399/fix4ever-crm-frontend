/**
 * Extracts a user-friendly error message from API error responses.
 * Use this when handling errors from axios/fetch to show consistent toast messages.
 *
 * @param err - The caught error (typically from a failed API call)
 * @param fallback - Default message when the API doesn't provide one
 * @returns A string suitable for display to the user
 */
export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong",
): string {
  const apiError = err as { response?: { data?: { message?: string } } };
  return apiError?.response?.data?.message ?? fallback;
}
