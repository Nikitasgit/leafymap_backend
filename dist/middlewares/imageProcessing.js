"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleImageProcessingError = exports.processImageToMultipleSizes = void 0;
const sharp_1 = __importDefault(require("sharp"));
const client_s3_1 = require("@aws-sdk/client-s3");
const response_1 = require("../utils/response");
const path_1 = __importDefault(require("path"));
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});
const uploadToS3 = async (buffer, key, contentType) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || "",
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });
    await s3.send(command);
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
const processImageToMultipleSizes = async (originalBuffer, originalName, mimetype) => {
    try {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileExtension = path_1.default.extname(originalName);
        const baseName = path_1.default.basename(originalName, fileExtension);
        const originalKey = `images/original/${baseName}-${uniqueSuffix}${fileExtension}`;
        const thumbnailKey = `images/thumbnail/${baseName}-${uniqueSuffix}${fileExtension}`;
        const mediumKey = `images/medium/${baseName}-${uniqueSuffix}${fileExtension}`;
        const originalBufferProcessed = await (0, sharp_1.default)(originalBuffer)
            .jpeg({ quality: 90 })
            .png({ quality: 90 })
            .toBuffer();
        const thumbnailBuffer = await (0, sharp_1.default)(originalBuffer)
            .resize(150, 150, {
            fit: "cover",
            position: "center",
        })
            .jpeg({ quality: 80 })
            .png({ quality: 80 })
            .toBuffer();
        const mediumBuffer = await (0, sharp_1.default)(originalBuffer)
            .resize(800, 600, {
            fit: "inside",
            withoutEnlargement: true,
        })
            .jpeg({ quality: 85 })
            .png({ quality: 85 })
            .toBuffer();
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
    }
    catch (error) {
        console.error("Erreur lors du traitement de l'image:", error);
        throw new Error("Erreur lors du traitement de l'image");
    }
};
exports.processImageToMultipleSizes = processImageToMultipleSizes;
const handleImageProcessingError = (err, req, res, next) => {
    if (err) {
        console.error("ERREUR TRAITEMENT IMAGE:", err);
        (0, response_1.APIResponse)(res, null, "Erreur lors du traitement de l'image", 500);
        return;
    }
    next();
};
exports.handleImageProcessingError = handleImageProcessingError;
