import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { APIResponse } from "../utils/response";

export interface S3File extends Express.Multer.File {
  location: string;
}

interface MulterError extends Error {
  code?: string;
}

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME || "",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const key = `${file.fieldname}-${uniqueSuffix}${path.extname(
        file.originalname
      )}`;
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
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF and WebP are allowed."
        )
      );
    }
  },
});

export const handleUploadError = (
  err: MulterError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err) {
    console.log("ERREUR MULTER UPLOAD:", err);
    if (err.code === "LIMIT_FILE_SIZE") {
      APIResponse(
        res,
        null,
        "La taille du fichier est trop grande. Maximum 5MB autorisé.",
        400
      );
      return;
    }
    if (err.message.includes("Invalid file type")) {
      APIResponse(
        res,
        null,
        "Type de fichier non autorisé. Seuls JPEG, PNG, GIF et WebP sont acceptés.",
        400
      );
      return;
    }
    APIResponse(res, null, "Erreur lors de l'upload du fichier", 400);
    return;
  }
  next();
};

export default upload;
