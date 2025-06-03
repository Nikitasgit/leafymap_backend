import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function generateSignedUrlFromFullUrl(fullUrl) {
  const bucketName = "linkal";
  const key = fullUrl.replace("https://linkal.s3.eu-west-3.amazonaws.com/", "");

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: decodeURIComponent(key),
  });

  const expiresIn = 60 * 10; // 10 minutes
  const signedUrl = await getSignedUrl(s3, command, { expiresIn });
  return signedUrl;
}

export { generateSignedUrlFromFullUrl };
