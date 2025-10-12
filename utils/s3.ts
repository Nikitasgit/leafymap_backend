import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const bucketName = process.env.AWS_BUCKET_NAME!;

/**
 * Generates a temporary signed URL from a full S3 URL.
 * Signed URLs expire after 10 minutes for security.
 * @param fullUrl - The full S3 URL (e.g., https://bucket.s3.region.amazonaws.com/key)
 * @returns A pre-signed URL that grants temporary access to the S3 object
 */
async function generateSignedUrlFromFullUrl(fullUrl: string): Promise<string> {
  if (!fullUrl || typeof fullUrl !== "string") {
    throw new Error("Invalid URL provided to generateSignedUrlFromFullUrl");
  }

  const region = process.env.AWS_REGION;
  // Extract the S3 key from the full URL
  const key = fullUrl.replace(
    `https://${bucketName}.s3.${region}.amazonaws.com/`,
    ""
  );

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: decodeURIComponent(key),
  });

  const expiresIn = 60 * 10; // 10 minutes
  const signedUrl = await getSignedUrl(s3, command, { expiresIn });
  return signedUrl;
}

/**
 * Deletes an object from S3 given its full URL.
 * Handles signed URLs by removing query parameters before extraction.
 * @returns true if deletion succeeded, false if it failed
 */
async function deleteObjectFromS3(fullUrl: string): Promise<boolean> {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME as string;
    const region = process.env.AWS_REGION;
    // Remove query parameters (e.g., signed URL params)
    const cleanUrl = fullUrl.split("?")[0];
    const key = cleanUrl.replace(
      `https://${bucketName}.s3.${region}.amazonaws.com/`,
      ""
    );

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: decodeURIComponent(key),
    });

    await s3.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting object from S3:", error);
    return false;
  }
}

export { generateSignedUrlFromFullUrl, deleteObjectFromS3 };
