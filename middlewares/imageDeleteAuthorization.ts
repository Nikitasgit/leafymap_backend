import { Response, NextFunction } from "express";
import Image from "../models/Image";
import { CustomRequest } from "../types/custom";
import { APIResponse } from "../utils/response";

const imagesOwnership = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { images } = req.body;
    const userId = req.decoded?.id;

    if (!userId) {
      APIResponse(res, null, "Non autorisé", 401);
      return;
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      APIResponse(res, null, "IDs d'images requis", 400);
      return;
    }

    // Fetch all images to verify ownership
    const userImages = await Image.find({ _id: { $in: images } });

    if (userImages.length !== images.length) {
      APIResponse(res, null, "Certaines images n'ont pas été trouvées", 404);
      return;
    }

    // Check authorization for each image using the user field
    for (const image of userImages) {
      if (!image.user || image.user.toString() !== userId) {
        APIResponse(
          res,
          null,
          `Vous n'êtes pas autorisé à accéder à l'image ${image._id}`,
          403
        );
        return;
      }
    }

    next();
  } catch (error) {
    APIResponse(
      res,
      null,
      "Erreur serveur lors de la vérification des autorisations",
      500
    );
  }
};

export default imagesOwnership;
