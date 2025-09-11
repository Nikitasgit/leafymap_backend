"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Image_1 = __importDefault(require("../models/Image"));
const response_1 = require("../utils/response");
const imagesOwnership = async (req, res, next) => {
    var _a;
    try {
        const { images } = req.body;
        const userId = (_a = req.decoded) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, response_1.APIResponse)(res, null, "Non autorisé", 401);
            return;
        }
        if (!images || !Array.isArray(images) || images.length === 0) {
            (0, response_1.APIResponse)(res, null, "IDs d'images requis", 400);
            return;
        }
        // Fetch all images to verify ownership
        const userImages = await Image_1.default.find({ _id: { $in: images } });
        if (userImages.length !== images.length) {
            (0, response_1.APIResponse)(res, null, "Certaines images n'ont pas été trouvées", 404);
            return;
        }
        // Check authorization for each image using the user field
        for (const image of userImages) {
            if (!image.user || image.user.toString() !== userId) {
                (0, response_1.APIResponse)(res, null, `Vous n'êtes pas autorisé à accéder à l'image ${image._id}`, 403);
                return;
            }
        }
        next();
    }
    catch (error) {
        (0, response_1.APIResponse)(res, null, "Erreur serveur lors de la vérification des autorisations", 500);
    }
};
exports.default = imagesOwnership;
