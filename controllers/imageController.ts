import { Response } from "express";
import Image from "../models/Image";
import { CustomRequest } from "../types/custom";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { generateSignedUrlFromFullUrl, deleteObjectFromS3 } from "../utils/s3";
import { processImageToMultipleSizes } from "../middlewares/imageProcessing";
import { ImageService } from "../services";

export const uploadImages = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { reference, referenceType, type } = req.body;
    const files = Array.isArray(req.files) ? req.files : req.files?.images;
    if (!files || files.length === 0) {
      APIResponse(res, null, "Aucune image fournie", 400);
      return;
    }

    let filesToProcess = files;
    const onlyOneImageTypes = ["profile", "cover"];
    if (
      onlyOneImageTypes.includes(type) &&
      ["event", "place", "user"].includes(referenceType)
    ) {
      filesToProcess = files.slice(0, 1);
    }

    const imageResults = await Promise.all(
      filesToProcess.map(async (file: Express.Multer.File) => {
        const processedUrls = await processImageToMultipleSizes(
          file.buffer,
          file.originalname,
          file.mimetype
        );

        return {
          urls: processedUrls,
          user: req.decoded!.id,
          referenceType: referenceType,
          reference: reference,
          type: type,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        };
      })
    );

    const createdImages = await Image.insertMany(imageResults);

    const imagesWithSignedUrls = await Promise.all(
      createdImages.map(async (image) => {
        const signedUrls = {
          original: await generateSignedUrlFromFullUrl(image.urls.original),
          thumbnail: await generateSignedUrlFromFullUrl(image.urls.thumbnail),
          medium: await generateSignedUrlFromFullUrl(image.urls.medium),
        };
        return {
          ...image.toObject(),
          signedUrls,
        };
      })
    );

    APIResponse(
      res,
      {
        images: imagesWithSignedUrls,
        count: imagesWithSignedUrls.length,
      },
      "Images uploadées et créées avec succès",
      200
    );
  } catch (error) {
    logger.error("Erreur lors de l'upload et création des images:", error);
    APIResponse(res, null, "Erreur serveur lors de l'upload des images", 500);
  }
};

export const deleteImages = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    await ImageService.deleteImages(req.images!);
    APIResponse(res, null, "Images supprimées avec succès", 200);
  } catch (error) {
    logger.error("Erreur lors de la suppression des images:", error);
    APIResponse(
      res,
      null,
      "Erreur serveur lors de la suppression des images",
      500
    );
  }
};
