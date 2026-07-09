import { RequestHandler, Response, NextFunction } from "express";
import { APIResponse } from "@/utils/response";
import { CustomRequest } from "@/types/custom";
import { ImageReferenceType } from "@/types/repositories/image.repository.types";
import { IImageRepository } from "@/types/repositories/image.repository.types";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IEvent, IPlace } from "@/types/models";
import { resolveOwnerId, toId } from "@/utils/mongoose";

class ImagesMiddleware {
  constructor(
    private imageRepository: IImageRepository,
    private placeRepository: IPlaceRepository,
    private eventRepository: IEventRepository
  ) {}

  ownership(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { images } = req.body;
        const userId = req.decoded!.id;

        if (!images || !Array.isArray(images) || images.length === 0) {
          APIResponse(res, null, "Images requises", 400);
          return;
        }

        const imageIds = images
          .map((image) => {
            return typeof image === "string" ? image : image._id;
          })
          .filter((id) => id);

        if (imageIds.length === 0) {
          APIResponse(res, null, "IDs d'images valides requis", 400);
          return;
        }

        const userImages = await this.imageRepository.findAll({
          filters: {
            _id: { $in: imageIds },
          },
          project: ["_id", "user"],
        });

        if (userImages.length !== imageIds.length) {
          APIResponse(
            res,
            null,
            "Certaines images n'ont pas été trouvées",
            404
          );
          return;
        }

        for (const image of userImages) {
          if (!image.user || toId(image.user) !== userId) {
            APIResponse(
              res,
              null,
              `Vous n'êtes pas autorisé à accéder à l'image ${image._id}`,
              403
            );
            return;
          }
        }

        req.images = imageIds;
        next();
      } catch {
        APIResponse(
          res,
          null,
          "Erreur lors de la vérification des autorisations",
          403
        );
      }
    };
  }

  referenceOwnership(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const userId = req.decoded?.id;
        if (!userId) {
          APIResponse(res, null, "Non autorisé", 401);
          return;
        }

        const { reference, referenceType } = req.body;

        if (!reference || !referenceType) {
          APIResponse(res, null, "reference et referenceType sont requis", 400);
          return;
        }

        let isOwner = false;
        let foundReference: IPlace | IEvent | null = null;

        switch (referenceType as ImageReferenceType) {
          case "Place": {
            const place = await this.placeRepository.findById(reference, [
              "user",
            ]);
            if (!place) {
              APIResponse(
                res,
                null,
                `La place avec l'ID ${reference} n'existe pas`,
                404
              );
              return;
            }
            isOwner = toId(place.user) === userId;
            foundReference = place;
            break;
          }

          case "Event": {
            const event = await this.eventRepository.findById(reference, [
              "user",
              "place",
              "place.user",
            ]);
            if (!event) {
              APIResponse(
                res,
                null,
                `L'événement avec l'ID ${reference} n'existe pas`,
                404
              );
              return;
            }

            const ownerId = resolveOwnerId(event);
            if (!ownerId) {
              APIResponse(
                res,
                null,
                "Erreur lors de la vérification de propriété",
                500
              );
              return;
            }

            isOwner = ownerId === userId;
            foundReference = event;
            break;
          }

          case "User": {
            isOwner = reference === userId;
            foundReference = null;
            break;
          }

          case "Comment":
          case "Review": {
            APIResponse(
              res,
              null,
              `Type de référence '${referenceType}' non encore implémenté`,
              400
            );
            return;
          }

          default:
            APIResponse(res, null, "Type de référence invalide", 400);
            return;
        }

        req.imageReferenceIsOwner = isOwner;
        req.imageReference = foundReference;

        next();
      } catch {
        APIResponse(
          res,
          null,
          "Erreur lors de la vérification de propriété",
          500
        );
      }
    };
  }
}

export default ImagesMiddleware;
