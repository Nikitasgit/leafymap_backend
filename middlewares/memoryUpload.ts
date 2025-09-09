import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { APIResponse } from "../utils/response";

interface MulterError extends Error {
  code?: string;
}

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
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
