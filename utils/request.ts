import { ParamsDictionary } from "express-serve-static-core";

/**
 * Returns a route param as string. Express types params as string | string[];
 * our routes use simple :param segments, so we normalize to a single string.
 */
export function getParam(
  params: ParamsDictionary,
  key: string
): string | undefined {
  const value = params[key];
  return typeof value === "string" ? value : value?.[0];
}
