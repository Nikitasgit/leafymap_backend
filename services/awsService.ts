import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import logger from "../utils/logger";

class AwsService {
  private s3: S3Client;
  private bucketName: string;
  private region: string;

  constructor() {
    this.region = process.env.AWS_REGION!;
    this.bucketName = process.env.AWS_BUCKET_NAME!;
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  /**
   * Generates a temporary signed URL from a full S3 URL.
   * Signed URLs expire after 10 minutes for security.
   * @param fullUrl - The full S3 URL (e.g., https://bucket.s3.region.amazonaws.com/key)
   * @returns A pre-signed URL that grants temporary access to the S3 object
   */
  async generateSignedUrlFromFullUrl(fullUrl: string): Promise<string> {
    if (!fullUrl || typeof fullUrl !== "string") {
      throw new Error("Invalid URL provided to generateSignedUrlFromFullUrl");
    }

    // Extract the S3 key from the full URL
    const key = fullUrl.replace(
      `https://${this.bucketName}.s3.${this.region}.amazonaws.com/`,
      ""
    );

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: decodeURIComponent(key),
    });

    const expiresIn = 60 * 10; // 10 minutes
    const signedUrl = await getSignedUrl(this.s3, command, { expiresIn });
    return signedUrl;
  }

  /**
   * Uploads a buffer to S3 and returns the full URL.
   * @param buffer - The file buffer to upload
   * @param key - The S3 key (path) where the file will be stored
   * @param contentType - The MIME type of the file
   * @returns The full S3 URL of the uploaded object
   */
  async uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.s3.send(command);
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Deletes an object from S3 given its full URL.
   * Handles signed URLs by removing query parameters before extraction.
   * @param fullUrl - The full S3 URL
   * @returns true if deletion succeeded, false if it failed
   */
  async deleteObjectFromS3(fullUrl: string): Promise<boolean> {
    try {
      // Remove query parameters (e.g., signed URL params)
      const cleanUrl = fullUrl.split("?")[0];
      const key = cleanUrl.replace(
        `https://${this.bucketName}.s3.${this.region}.amazonaws.com/`,
        ""
      );

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: decodeURIComponent(key),
      });

      await this.s3.send(command);
      return true;
    } catch (error) {
      logger.error("Error deleting object from S3:", error);
      return false;
    }
  }
}

export default AwsService;
