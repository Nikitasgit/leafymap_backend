import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Request, Response, NextFunction } from "express";
import { APIResponse } from "../utils/response";
import path from "path";

export interface ProcessedImageUrls {
  original: string;
  thumbnail: string;
  medium: string;
}

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const uploadToS3 = async (
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3.send(command);
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

/**
 * Processes an uploaded image into three sizes and uploads them to S3:
 * - Original: optimized with 90% quality
 * - Thumbnail: 150x150 cropped (for avatars, cards)
 * - Medium: max 800x600 (for galleries, previews)
 */
export const processImageToMultipleSizes = async (
  originalBuffer: Buffer,
  originalName: string,
  mimetype: string
): Promise<ProcessedImageUrls> => {
  try {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(originalName);
    const baseName = path.basename(originalName, fileExtension);
    const originalKey = `images/original/${baseName}-${uniqueSuffix}${fileExtension}`;
    const thumbnailKey = `images/thumbnail/${baseName}-${uniqueSuffix}${fileExtension}`;
    const mediumKey = `images/medium/${baseName}-${uniqueSuffix}${fileExtension}`;

    const originalBufferProcessed = await sharp(originalBuffer)
      .jpeg({ quality: 90 })
      .png({ quality: 90 })
      .toBuffer();

    // Thumbnail: square crop, centered
    const thumbnailBuffer = await sharp(originalBuffer)
      .resize(150, 150, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .png({ quality: 80 })
      .toBuffer();

    // Medium: fit inside dimensions, preserve aspect ratio
    const mediumBuffer = await sharp(originalBuffer)
      .resize(800, 600, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .png({ quality: 85 })
      .toBuffer();

    // Upload all three sizes in parallel for better performance
    const [originalUrl, thumbnailUrl, mediumUrl] = await Promise.all([
      uploadToS3(originalBufferProcessed, originalKey, mimetype),
      uploadToS3(thumbnailBuffer, thumbnailKey, mimetype),
      uploadToS3(mediumBuffer, mediumKey, mimetype),
    ]);

    return {
      original: originalUrl,
      thumbnail: thumbnailUrl,
      medium: mediumUrl,
    };
  } catch (error) {
    console.error("Erreur lors du traitement de l'image:", error);
    throw new Error("Erreur lors du traitement de l'image");
  }
};

export const handleImageProcessingError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err) {
    console.error("ERREUR TRAITEMENT IMAGE:", err);
    APIResponse(res, null, "Erreur lors du traitement de l'image", 500);
    return;
  }
  next();
};
