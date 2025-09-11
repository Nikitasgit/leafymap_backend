"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const s3_1 = require("../utils/s3");
const Image_1 = __importDefault(require("../models/Image"));
const deleteImages = async (imageIds) => {
    if (imageIds.length === 0)
        return;
    try {
        const imagesToDelete = await Image_1.default.find({ _id: { $in: imageIds } });
        await Image_1.default.deleteMany({ _id: { $in: imageIds } });
        await Promise.allSettled(imagesToDelete.map(async (image) => {
            if (!image.urls) {
                logger_1.default.warn(`No URLs found for image ${image._id}`);
                return;
            }
            const deleteResults = await Promise.allSettled([
                (0, s3_1.deleteObjectFromS3)(image.urls.original),
                (0, s3_1.deleteObjectFromS3)(image.urls.thumbnail),
                (0, s3_1.deleteObjectFromS3)(image.urls.medium),
            ]);
            const successfulDeletions = deleteResults.filter((result) => result.status === "fulfilled" && result.value).length;
            logger_1.default.info(`Image ${image._id}: ${successfulDeletions}/3 files deleted from S3`);
        }));
        logger_1.default.info(`Successfully deleted ${imageIds.length} images from database and S3`);
    }
    catch (error) {
        logger_1.default.error("Error deleting images:", error);
        throw error;
    }
};
exports.ImageService = {
    deleteImages,
};
