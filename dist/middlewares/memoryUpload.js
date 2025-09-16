"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = void 0;
const multer_1 = __importDefault(require("multer"));
const response_1 = require("../utils/response");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Invalid file type. Only JPEG, PNG, GIF and WebP are allowed."));
        }
    },
});
const handleUploadError = (err, req, res, next) => {
    if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
            (0, response_1.APIResponse)(res, null, "La taille du fichier est trop grande. Maximum 10MB autorisé.", 400);
            return;
        }
        if (err.message.includes("Invalid file type")) {
            (0, response_1.APIResponse)(res, null, "Type de fichier non autorisé. Seuls JPEG, PNG, GIF et WebP sont acceptés.", 400);
            return;
        }
        (0, response_1.APIResponse)(res, null, "Erreur lors de l'upload du fichier", 400);
        return;
    }
    next();
};
exports.handleUploadError = handleUploadError;
exports.default = upload;
