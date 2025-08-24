import { Response } from "express";
import { CustomRequest } from "../types/custom";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { generateSignedUrlFromFullUrl, deleteObjectFromS3 } from "../utils/s3";
import { S3File } from "../middlewares/uploadToS3";

const uploadImages = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const files = Array.isArray(req.files) ? req.files : req.files?.images;
    if (!files || files.length === 0) {
      APIResponse(res, null, "No images provided", 400);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        APIResponse(
          res,
          null,
          `Invalid file type: ${file.originalname}. Only JPEG, PNG, GIF and WebP are allowed.`,
          400
        );
        return;
      }

      if (file.size > maxSize) {
        APIResponse(
          res,
          null,
          `File too large: ${file.originalname}. Maximum size is 5MB.`,
          400
        );
        return;
      }
    }

    const imageResults = await Promise.all(
      files.map(async (file: S3File) => {
        const signedUrl = await generateSignedUrlFromFullUrl(file.location);
        return {
          originalName: file.originalname,
          url: file.location,
          signedUrl: signedUrl,
          size: file.size,
          mimetype: file.mimetype,
        };
      })
    );

    APIResponse(
      res,
      {
        images: imageResults,
        count: imageResults.length,
      },
      "Images uploaded successfully",
      200
    );
  } catch (error) {
    logger.error("Error uploading images:", error);
    if (error instanceof Error) {
      APIResponse(res, null, `Failed to upload images: ${error.message}`, 500);
    } else {
      APIResponse(res, null, "Failed to upload images", 500);
    }
  }
};

const deleteImages = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { imageUrls } = req.body;
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      APIResponse(res, null, "No image URLs provided", 400);
      return;
    }

    const deleteResults = await Promise.allSettled(
      imageUrls.map(async (imageUrl) => {
        const success = await deleteObjectFromS3(imageUrl);
        return {
          url: imageUrl,
          deleted: success,
        };
      })
    );

    APIResponse(
      res,
      {
        results: deleteResults,
        totalRequested: imageUrls.length,
      },
      `Images deletion completed. ${deleteResults.length} deleted, ${deleteResults.length} failed.`,
      200
    );
  } catch (error) {
    logger.error("Error deleting images:", error);
    if (error instanceof Error) {
      APIResponse(res, null, `Failed to delete images: ${error.message}`, 500);
    } else {
      APIResponse(res, null, "Failed to delete images", 500);
    }
  }
};

export { uploadImages, deleteImages };
