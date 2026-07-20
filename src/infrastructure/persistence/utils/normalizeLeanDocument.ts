import { Types } from "mongoose";

/**
 * Converts lean Mongo documents into API/application-safe plain objects:
 * - `_id` → `id`
 * - ObjectId → string
 * Recurses through arrays and nested plain objects.
 */
const isObjectId = (value: unknown): value is Types.ObjectId =>
  value instanceof Types.ObjectId ||
  (typeof value === "object" &&
    value !== null &&
    (value as { _bsontype?: string })._bsontype === "ObjectId" &&
    typeof (value as { toString(): string }).toString === "function");

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  !(value instanceof Date) &&
  !(value instanceof Buffer) &&
  !isObjectId(value);

export const normalizeLeanDocument = <T = Record<string, unknown>>(
  value: unknown
): T => {
  const walk = (node: unknown): unknown => {
    if (node == null) {
      return node;
    }

    if (isObjectId(node)) {
      return node.toString();
    }

    if (Array.isArray(node)) {
      return node.map(walk);
    }

    if (!isPlainObject(node)) {
      return node;
    }

    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(node)) {
      const nextKey = key === "_id" ? "id" : key;
      result[nextKey] = walk(child);
    }
    return result;
  };

  return walk(value) as T;
};

export const normalizeLeanDocuments = <T = Record<string, unknown>>(
  values: unknown[]
): T[] => values.map((value) => normalizeLeanDocument<T>(value));
