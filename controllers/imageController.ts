import { Response } from "express";
import Image from "../models/Image";
import { CustomRequest } from "../types/custom";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { generateSignedUrlFromFullUrl, deleteObjectFromS3 } from "../utils/s3";
import { processImageToMultipleSizes } from "../middlewares/imageProcessing";

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
    const imagesToDelete = await Image.find({ _id: { $in: req.images } });
    const deletedFromDB = await Image.deleteMany({ _id: { $in: req.images } });

    const s3DeleteResults = await Promise.allSettled(
      imagesToDelete.map(async (image) => {
        if (!image.urls) {
          return {
            imageId: image._id,
            urls: null,
            deletedFromS3: false,
            deletionDetails: {
              original: false,
              thumbnail: false,
              medium: false,
            },
            error: "No URLs found for image",
          };
        }
        const deleteResults = await Promise.allSettled([
          deleteObjectFromS3(image.urls.original),
          deleteObjectFromS3(image.urls.thumbnail),
          deleteObjectFromS3(image.urls.medium),
        ]);

        const successfulDeletions = deleteResults.filter(
          (result) => result.status === "fulfilled" && result.value
        ).length;

        return {
          imageId: image._id,
          urls: image.urls,
          deletedFromS3: successfulDeletions === 3,
          deletionDetails: {
            original:
              deleteResults[0].status === "fulfilled"
                ? deleteResults[0].value
                : false,
            thumbnail:
              deleteResults[1].status === "fulfilled"
                ? deleteResults[1].value
                : false,
            medium:
              deleteResults[2].status === "fulfilled"
                ? deleteResults[2].value
                : false,
          },
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
