/**
 * Returns a route param as string. Express types params as string | string[];
 * our routes use simple :param segments, so we normalize to a single string.
 */
export function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  return typeof value === "string" ? value : value?.[0];
}
