import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";

export interface S3File extends Express.Multer.File {
  location: string;
}

if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_BUCKET_NAME
) {
  console.error("❌ Variables d'environnement AWS manquantes!");
  console.error("AWS_ACCESS_KEY_ID:", !!process.env.AWS_ACCESS_KEY_ID);
  console.error("AWS_SECRET_ACCESS_KEY:", !!process.env.AWS_SECRET_ACCESS_KEY);
  console.error("AWS_BUCKET_NAME:", !!process.env.AWS_BUCKET_NAME);
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
      console.log("📤 Uploading file:", file.originalname, "->", key);
      cb(null, key);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log(
      "🔍 Processing file:",
      file.originalname,
      "Type:",
      file.mimetype
    );
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.error("❌ Invalid file type:", file.mimetype);
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF and WebP are allowed."
        )
      );
    }
  },
});

// Middleware pour gérer les erreurs multer
export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error:
          "La taille du fichier est trop grande. La taille maximale est de 5MB.",
      });
    }
    return res.status(400).json({
      error: `Erreur d'upload: ${err.message}`,
    });
  } else if (err) {
    return res.status(400).json({
      error: err.message,
    });
  }
  next();
};

console.log("upload", upload);
export default upload;
