import sharp from "sharp";
import path from "path";
import logger from "@/utils/logger";

export interface ProcessedImageUrls {
  original: string;
  thumbnail: string;
  medium: string;
}

class ImageProcessingService {
  /**
   * Processes an uploaded image into three sizes:
   * - Original: optimized with 90% quality
   * - Thumbnail: 150x150 cropped (for avatars, cards)
   * - Medium: max 800x600 (for galleries, previews)
   * @param originalBuffer - The original image buffer
   * @param originalName - The original file name
   * @returns Object containing buffers for original, thumbnail, and medium sizes with their keys
   */
  async processImageToMultipleSizes(
    originalBuffer: Buffer,
    originalName: string
  ): Promise<{
    original: { buffer: Buffer; key: string };
    thumbnail: { buffer: Buffer; key: string };
    medium: { buffer: Buffer; key: string };
  }> {
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

      return {
        original: { buffer: originalBufferProcessed, key: originalKey },
        thumbnail: { buffer: thumbnailBuffer, key: thumbnailKey },
        medium: { buffer: mediumBuffer, key: mediumKey },
      };
    } catch (error) {
      logger.error("Erreur lors du traitement de l'image:", error);
      throw new Error("Erreur lors du traitement de l'image");
    }
  }
}

export default ImageProcessingService;
