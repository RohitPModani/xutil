/**
 * Narrows a caught value to a displayable message.
 *
 * Catch bindings are `unknown` - anything can be thrown - so this centralises
 * the check that used to be spelled `catch (err)` followed by
 * `getErrorMessage(err, "fallback")` in every tool.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return fallback;
};
