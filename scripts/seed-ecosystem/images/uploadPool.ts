import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import { S3_SEED_PREFIX, type ImageTheme } from "../config";
import type { ImagePool, ImagePoolUrls } from "../types";
import {
  THEME_COLORS,
  UNSPLASH_CATALOG,
  unsplashUrl,
} from "./catalog";

export function createSeedS3Client(): S3Client {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "AWS_REGION, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required to upload seed images."
    );
  }
  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function requireBucket(): { bucket: string; region: string } {
  const bucket = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  if (!bucket || !region) {
    throw new Error("AWS_BUCKET_NAME and AWS_REGION are required.");
  }
  return { bucket, region };
}

export function s3ObjectUrl(key: string): string {
  const { bucket, region } = requireBucket();
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "leafymap-seed-ecosystem/1.0" },
    });
    if (!response.ok) {
      return null;
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      return null;
    }
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

async function placeholderJpeg(theme: ImageTheme, index: number): Promise<Buffer> {
  const color = THEME_COLORS[theme];
  const label = `${theme} ${index + 1}`;
  const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="${color}"/>
    <text x="400" y="310" text-anchor="middle" font-family="sans-serif" font-size="42" fill="#ffffff">${label}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toBuffer();
}

async function processSizes(buffer: Buffer): Promise<{
  original: Buffer;
  thumbnail: Buffer;
  medium: Buffer;
}> {
  const [original, thumbnail, medium] = await Promise.all([
    sharp(buffer).jpeg({ quality: 90 }).toBuffer(),
    sharp(buffer)
      .resize(150, 150, { fit: "cover", position: "center" })
      .jpeg({ quality: 80 })
      .toBuffer(),
    sharp(buffer)
      .resize(800, 600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer(),
  ]);
  return { original, thumbnail, medium };
}

async function putJpeg(
  s3: S3Client,
  bucket: string,
  key: string,
  body: Buffer
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "image/jpeg",
    })
  );
}

export async function uploadImagePool(s3: S3Client): Promise<ImagePool> {
  const { bucket } = requireBucket();
  const pool = {} as ImagePool;
  const themes = Object.keys(UNSPLASH_CATALOG) as ImageTheme[];

  for (const theme of themes) {
    const urls: ImagePoolUrls[] = [];
    const photoIds = UNSPLASH_CATALOG[theme];
    for (let i = 0; i < photoIds.length; i += 1) {
      const downloaded = await downloadImage(unsplashUrl(photoIds[i]));
      if (!downloaded) {
        console.warn(
          `  Unsplash 404 or timeout for ${photoIds[i]} (${theme}); using labeled placeholder`
        );
      }
      const source = downloaded ?? (await placeholderJpeg(theme, i));
      const sizes = await processSizes(source);
      const stem = `${theme}-${i + 1}`;
      const originalKey = `${S3_SEED_PREFIX}original/${stem}.jpg`;
      const thumbnailKey = `${S3_SEED_PREFIX}thumbnail/${stem}.jpg`;
      const mediumKey = `${S3_SEED_PREFIX}medium/${stem}.jpg`;

      await Promise.all([
        putJpeg(s3, bucket, originalKey, sizes.original),
        putJpeg(s3, bucket, thumbnailKey, sizes.thumbnail),
        putJpeg(s3, bucket, mediumKey, sizes.medium),
      ]);

      urls.push({
        original: s3ObjectUrl(originalKey),
        thumbnail: s3ObjectUrl(thumbnailKey),
        medium: s3ObjectUrl(mediumKey),
      });
      process.stdout.write(`  uploaded ${stem}\n`);
    }
    pool[theme] = urls;
  }

  return pool;
}

export async function deleteSeedImagesFromS3(s3: S3Client): Promise<number> {
  const { bucket } = requireBucket();
  let deleted = 0;
  let token: string | undefined;

  do {
    const listed = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: S3_SEED_PREFIX,
        ContinuationToken: token,
      })
    );
    const objects = (listed.Contents ?? [])
      .map((item) => item.Key)
      .filter((key): key is string => Boolean(key))
      .map((Key) => ({ Key }));

    if (objects.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: objects },
        })
      );
      deleted += objects.length;
    }

    token = listed.IsTruncated ? listed.NextContinuationToken : undefined;
  } while (token);

  return deleted;
}
