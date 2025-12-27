import sharp from "sharp";
import path from "path";
import AwsService from "./awsService";

export interface ProcessedImageUrls {
  original: string;
  thumbnail: string;
  medium: string;
}

class ImageProcessingService {
  constructor(private awsService: AwsService) {}

  /**
   * Processes an uploaded image into three sizes and uploads them to S3:
   * - Original: optimized with 90% quality
   * - Thumbnail: 150x150 cropped (for avatars, cards)
   * - Medium: max 800x600 (for galleries, previews)
   */
  async processImageToMultipleSizes(
    originalBuffer: Buffer,
    originalName: string,
    mimetype: string
  ): Promise<ProcessedImageUrls> {
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
        this.awsService.uploadToS3(
          originalBufferProcessed,
          originalKey,
          mimetype
        ),
        this.awsService.uploadToS3(thumbnailBuffer, thumbnailKey, mimetype),
        this.awsService.uploadToS3(mediumBuffer, mediumKey, mimetype),
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
  }
}

export default ImageProcessingService;
