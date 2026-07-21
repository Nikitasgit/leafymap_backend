import { IImageStorage } from "@src/domain/interfaces/IImageStorage";
import { ImageUrls } from "@src/domain/value-objects/ImageUrls.vo";

const S3_URL_PATTERN =
  /^https:\/\/[^/]+\.s3\.[a-z0-9-]+\.amazonaws\.com\//i;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    value instanceof Date ||
    value instanceof Buffer
  ) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value) as object | null;
  return prototype === Object.prototype || prototype === null;
};

const isImageUrls = (value: unknown): value is ImageUrls => {
  if (!isPlainObject(value)) {
    return false;
  }
  return (
    typeof value.original === "string" &&
    typeof value.thumbnail === "string" &&
    typeof value.medium === "string"
  );
};

const isS3ObjectUrl = (value: string): boolean =>
  S3_URL_PATTERN.test(value.split("?")[0] ?? value);

/**
 * Recursively replaces private S3 image URLs with temporary signed URLs.
 * Covers nested `urls: { original, thumbnail, medium }` shapes and standalone
 * S3 URL strings (e.g. flattened collaborator thumbnails).
 */
export const signNestedImageUrls = async <T>(
  imageStorage: IImageStorage,
  value: T
): Promise<T> => {
  const signedUrlCache = new Map<string, Promise<string>>();

  const signSingleUrl = (url: string): Promise<string> => {
    const cacheKey = url.split("?")[0] ?? url;
    const cached = signedUrlCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const promise = imageStorage.signUrl(url);
    signedUrlCache.set(cacheKey, promise);
    return promise;
  };

  const walk = async (node: unknown): Promise<unknown> => {
    if (node == null) {
      return node;
    }

    if (typeof node === "string") {
      return isS3ObjectUrl(node) ? signSingleUrl(node) : node;
    }

    if (Array.isArray(node)) {
      return Promise.all(node.map((item) => walk(item)));
    }

    if (!isPlainObject(node)) {
      return node;
    }

    if (isImageUrls(node)) {
      const [original, thumbnail, medium] = await Promise.all([
        signSingleUrl(node.original),
        signSingleUrl(node.thumbnail),
        signSingleUrl(node.medium),
      ]);
      return { original, thumbnail, medium };
    }

    const entries = await Promise.all(
      Object.entries(node).map(async ([key, child]) => [key, await walk(child)])
    );
    return Object.fromEntries(entries);
  };

  return (await walk(value)) as T;
};
