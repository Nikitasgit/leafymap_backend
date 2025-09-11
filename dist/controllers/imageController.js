"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImages = exports.uploadImages = void 0;
const Image_1 = __importDefault(require("../models/Image"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const s3_1 = require("../utils/s3");
const imageProcessing_1 = require("../middlewares/imageProcessing");
const services_1 = require("../services");
const uploadImages = async (req, res) => {
    var _a;
    try {
        const { reference, referenceType, type } = req.body;
        const files = Array.isArray(req.files) ? req.files : (_a = req.files) === null || _a === void 0 ? void 0 : _a.images;
        if (!files || files.length === 0) {
            (0, response_1.APIResponse)(res, null, "Aucune image fournie", 400);
            return;
        }
        let filesToProcess = files;
        const onlyOneImageTypes = ["profile", "cover"];
        if (onlyOneImageTypes.includes(type) &&
            ["event", "place", "user"].includes(referenceType)) {
            filesToProcess = files.slice(0, 1);
        }
        const imageResults = await Promise.all(filesToProcess.map(async (file) => {
            const processedUrls = await (0, imageProcessing_1.processImageToMultipleSizes)(file.buffer, file.originalname, file.mimetype);
            return {
                urls: processedUrls,
                user: req.decoded.id,
                referenceType: referenceType,
                reference: reference,
                type: type,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
            };
        }));
        const createdImages = await Image_1.default.insertMany(imageResults);
        const imagesWithSignedUrls = await Promise.all(createdImages.map(async (image) => {
            const signedUrls = {
                original: await (0, s3_1.generateSignedUrlFromFullUrl)(image.urls.original),
                thumbnail: await (0, s3_1.generateSignedUrlFromFullUrl)(image.urls.thumbnail),
                medium: await (0, s3_1.generateSignedUrlFromFullUrl)(image.urls.medium),
            };
            return {
                ...image.toObject(),
                signedUrls,
            };
        }));
        (0, response_1.APIResponse)(res, {
            images: imagesWithSignedUrls,
            count: imagesWithSignedUrls.length,
        }, "Images uploadées et créées avec succès", 200);
    }
    catch (error) {
        logger_1.default.error("Erreur lors de l'upload et création des images:", error);
        (0, response_1.APIResponse)(res, null, "Erreur serveur lors de l'upload des images", 500);
    }
};
exports.uploadImages = uploadImages;
const deleteImages = async (req, res) => {
    try {
        await services_1.ImageService.deleteImages(req.images);
        (0, response_1.APIResponse)(res, null, "Images supprimées avec succès", 200);
    }
    catch (error) {
        logger_1.default.error("Erreur lors de la suppression des images:", error);
        (0, response_1.APIResponse)(res, null, "Erreur serveur lors de la suppression des images", 500);
    }
};
exports.deleteImages = deleteImages;
