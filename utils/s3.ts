import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});
const bucketName = process.env.AWS_BUCKET_NAME as string;
async function generateSignedUrlFromFullUrl(fullUrl: string): Promise<string> {
  const key = fullUrl.replace(
    `https://${bucketName}.s3.eu-west-3.amazonaws.com/`,
    ""
  );

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: decodeURIComponent(key),
  });

  const expiresIn = 60 * 10;
  const signedUrl = await getSignedUrl(s3, command, { expiresIn });
  return signedUrl;
}

async function deleteObjectFromS3(fullUrl: string): Promise<boolean> {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME as string;
    const cleanUrl = fullUrl.split("?")[0];
    const key = cleanUrl.replace(
      `https://${bucketName}.s3.eu-west-3.amazonaws.com/`,
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
