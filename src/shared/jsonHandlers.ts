/**
 * Safely parses a JSON string with a fallback value.
 * Used to parse query parameters that may contain JSON (e.g., filters).
 */
export const parseJson = <T>(str: string | undefined, fallback: T): T => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
};
