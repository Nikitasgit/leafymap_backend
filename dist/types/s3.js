"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSignedUrlFromFullUrl = void 0;
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});
const generateSignedUrlFromFullUrl = async (fullUrl) => {
    try {
        // Extract bucket and key from the full URL
        const url = new URL(fullUrl);
        const bucket = url.hostname.split(".")[0];
        const key = url.pathname.substring(1); // Remove leading slash
        const command = new client_s3_1.GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        // Generate a signed URL that expires in 1 hour
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, {
            expiresIn: 3600,
        });
        return signedUrl;
    }
    catch (error) {
        console.error("Error generating signed URL:", error);
        return fullUrl; // Return original URL if signing fails
    }
};
exports.generateSignedUrlFromFullUrl = generateSignedUrlFromFullUrl;
