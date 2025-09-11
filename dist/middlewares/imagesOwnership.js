"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Image_1 = __importDefault(require("../models/Image"));
const response_1 = require("../utils/response");
const imagesOwnership = async (req, res, next) => {
    try {
        const { images } = req.body;
        const userId = req.decoded.id;
        if (!images || !Array.isArray(images) || images.length === 0) {
            (0, response_1.APIResponse)(res, null, "Images requises", 400);
            return;
        }
        const imageIds = images
            .map((image) => {
            return typeof image === "string" ? image : image._id;
        })
            .filter((id) => id);
        if (imageIds.length === 0) {
            (0, response_1.APIResponse)(res, null, "IDs d'images valides requis", 400);
            return;
        }
        const userImages = await Image_1.default.find({ _id: { $in: imageIds } });
        if (userImages.length !== imageIds.length) {
            (0, response_1.APIResponse)(res, null, "Certaines images n'ont pas été trouvées", 404);
            return;
        }
        for (const image of userImages) {
            if (!image.user || image.user.toString() !== userId) {
                (0, response_1.APIResponse)(res, null, `Vous n'êtes pas autorisé à accéder à l'image ${image._id}`, 403);
                return;
            }
        }
        req.images = imageIds;
        next();
    }
    catch (error) {
        (0, response_1.APIResponse)(res, null, "Erreur lors de la vérification des autorisations", 403);
    }
};
exports.default = imagesOwnership;
