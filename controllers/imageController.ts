import { Response } from "express";
import Image from "../models/Image";
import { CustomRequest } from "../types/custom";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { generateSignedUrlFromFullUrl, deleteObjectFromS3 } from "../utils/s3";
import { S3File } from "../middlewares/uploadToS3";

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
      filesToProcess.map(async (file: S3File) => {
        return {
          url: file.location,
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

    const imagesWithSignedUrl = await Promise.all(
      createdImages.map(async (image) => {
        const signedUrl = await generateSignedUrlFromFullUrl(image.url);
        return {
          ...image.toObject(),
          signedUrl,
        };
      })
    );

    APIResponse(
      res,
      {
        images: imagesWithSignedUrl,
        count: imagesWithSignedUrl.length,
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
    const imagesToDelete = await Image.find({ _id: { $in: req.images } });
    const deletedFromDB = await Image.deleteMany({ _id: { $in: req.images } });

    const s3DeleteResults = await Promise.allSettled(
      imagesToDelete.map(async (image) => {
        const success = await deleteObjectFromS3(image.url);
        return {
          imageId: image._id,
          url: image.url,
          deletedFromS3: success,
        };
      })
    );

    const successfulS3Deletions = s3DeleteResults.filter(
      (result) => result.status === "fulfilled" && result.value.deletedFromS3
    ).length;

    const failedS3Deletions = s3DeleteResults.length - successfulS3Deletions;

    APIResponse(
      res,
      {
        deletedFromDB: deletedFromDB.deletedCount,
        deletedFromS3: successfulS3Deletions,
        failedS3Deletions: failedS3Deletions,
        s3DeleteResults: s3DeleteResults.map((result) =>
          result.status === "fulfilled"
            ? result.value
            : { error: result.reason }
        ),
      },
      `Images supprimées avec succès. ${deletedFromDB.deletedCount} supprimées de la BDD, ${successfulS3Deletions} supprimées de S3`,
      200
    );
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
