"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteObjectFromS3 = exports.generateSignedUrlFromFullUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const bucketName = process.env.AWS_BUCKET_NAME;
async function generateSignedUrlFromFullUrl(fullUrl) {
    if (!fullUrl || typeof fullUrl !== "string") {
        throw new Error("Invalid URL provided to generateSignedUrlFromFullUrl");
    }
    const region = process.env.AWS_REGION;
    const key = fullUrl.replace(`https://${bucketName}.s3.${region}.amazonaws.com/`, "");
    const command = new client_s3_1.GetObjectCommand({
        Bucket: bucketName,
        Key: decodeURIComponent(key),
    });
    const expiresIn = 60 * 10;
    const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn });
    return signedUrl;
}
exports.generateSignedUrlFromFullUrl = generateSignedUrlFromFullUrl;
async function deleteObjectFromS3(fullUrl) {
    try {
        const bucketName = process.env.AWS_BUCKET_NAME;
        const region = process.env.AWS_REGION;
        const cleanUrl = fullUrl.split("?")[0];
        const key = cleanUrl.replace(`https://${bucketName}.s3.${region}.amazonaws.com/`, "");
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: bucketName,
            Key: decodeURIComponent(key),
        });
        await s3.send(command);
        return true;
    }
    catch (error) {
        console.error("Error deleting object from S3:", error);
        return false;
    }
}
exports.deleteObjectFromS3 = deleteObjectFromS3;
