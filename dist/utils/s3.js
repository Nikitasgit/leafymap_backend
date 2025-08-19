"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSignedUrlFromFullUrl = generateSignedUrlFromFullUrl;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
async function generateSignedUrlFromFullUrl(fullUrl) {
    const bucketName = "linkal";
    const key = fullUrl.replace("https://linkal.s3.eu-west-3.amazonaws.com/", "");
    const command = new client_s3_1.GetObjectCommand({
        Bucket: bucketName,
        Key: decodeURIComponent(key),
    });
    const expiresIn = 60 * 10; // 10 minutes
    const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn });
    return signedUrl;
}
