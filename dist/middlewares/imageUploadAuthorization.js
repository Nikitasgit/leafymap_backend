"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Place_1 = __importDefault(require("../models/Place"));
const Event_1 = __importDefault(require("../models/Event"));
const response_1 = require("../utils/response");
const imageUploadAuthorization = async (req, res, next) => {
    var _a;
    try {
        const { reference, referenceType } = req.body;
        const userId = (_a = req.decoded) === null || _a === void 0 ? void 0 : _a.id;
        if (!reference || !referenceType) {
            (0, response_1.APIResponse)(res, null, "Référence et type de référence requis", 400);
            return;
        }
        let isAuthorized = false;
        switch (referenceType) {
            case "Place":
                const place = await Place_1.default.findById(reference);
                if (!place) {
                    (0, response_1.APIResponse)(res, null, "Lieu non trouvé", 404);
                    return;
                }
                isAuthorized = place.user.toString() === userId;
                break;
            case "Event":
                const event = await Event_1.default.findById(reference).populate("place");
                if (!event) {
                    (0, response_1.APIResponse)(res, null, "Événement non trouvé", 404);
                    return;
                }
                isAuthorized = event.place.user.toString() === userId;
                break;
            case "User":
                isAuthorized = reference === userId;
                break;
            case "Message":
                //  const message = await Message.findById(reference);
                // if (!message) {
                //   APIResponse(res, null, "Message non trouvé", 404);
                //   return;
                //  }
                //  isAuthorized = message.sender.toString() === userId;
                (0, response_1.APIResponse)(res, null, "Type de référence 'message' non encore implémenté", 400);
                return;
            case "Review":
                // const review = await Review.findById(reference);
                // if (!review) {
                //   APIResponse(res, null, "Avis non trouvé", 404);
                //   return;
                // }
                // isAuthorized = review.user.toString() === userId;
                (0, response_1.APIResponse)(res, null, "Type de référence 'review' non encore implémenté", 400);
                return;
            default:
                (0, response_1.APIResponse)(res, null, "Type de référence non valide", 400);
                return;
        }
        if (!isAuthorized) {
            (0, response_1.APIResponse)(res, null, "Accès non autorisé", 403);
            return;
        }
        next();
    }
    catch (error) {
        (0, response_1.APIResponse)(res, null, "Erreur serveur lors de la vérification des autorisations", 500);
    }
};
exports.default = imageUploadAuthorization;
