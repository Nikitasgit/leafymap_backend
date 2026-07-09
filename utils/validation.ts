import { z } from "zod";

/**
 * Validates data against a Zod schema and returns formatted errors if validation fails.
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns null if validation succeeds, or a Record<string, string> of errors if validation fails
 */
export const validateData = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): null | Record<string, string> => {
  const result = schema.safeParse(data);
  if (!result.success && result.error?.issues) {
    return result.error.issues.reduce((acc, err) => {
      const key = err.path.length > 0 ? err.path.join(".") : "_root";
      acc[key] = err.message;
      return acc;
    }, {} as Record<string, string>);
  }
  return null;
};
