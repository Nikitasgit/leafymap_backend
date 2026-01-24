import multer from "multer";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { APIResponse } from "@/utils/response";

interface MulterError extends Error {
  code?: string;
}

class UploadMiddleware {
  private storage = multer.memoryStorage();
  private upload = multer({
    storage: this.storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
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

  /**
   * Returns the multer instance for handling file uploads
   * @param fieldName - The name of the form field containing the files
   * @param maxCount - Maximum number of files to accept
   * @returns Multer middleware instance
   */
  array(fieldName: string, maxCount?: number) {
    return this.upload.array(fieldName, maxCount);
  }

  /**
   * Returns the multer instance for handling single file upload
   * @param fieldName - The name of the form field containing the file
   * @returns Multer middleware instance
   */
  single(fieldName: string) {
    return this.upload.single(fieldName);
  }

  /**
   * Returns the multer instance for handling multiple fields
   * @param fields - Array of field configurations
   * @returns Multer middleware instance
   */
  fields(fields: multer.Field[]) {
    return this.upload.fields(fields);
  }

  /**
   * Error handler middleware for multer upload errors
   */
  handleError(): ErrorRequestHandler {
    return (
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
  }
}

export default UploadMiddleware;
