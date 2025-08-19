"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMulterError = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const path_1 = __importDefault(require("path"));
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME || "",
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const key = `${file.fieldname}-${uniqueSuffix}${path_1.default.extname(file.originalname)}`;
            cb(null, key);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
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
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                error: "La taille du fichier est trop grande. La taille maximale est de 5MB.",
            });
        }
        return res.status(400).json({
            error: `Erreur d'upload: ${err.message}`,
        });
    }
    else if (err) {
        return res.status(400).json({
            error: err.message,
        });
    }
    next();
};
exports.handleMulterError = handleMulterError;
exports.default = upload;
