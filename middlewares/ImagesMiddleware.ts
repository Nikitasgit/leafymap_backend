import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../types/custom";
import { APIResponse } from "../utils/response";
import { ImageReferenceType } from "../repositories/images/IImageRepository";
import { IImageRepository } from "../repositories/images/IImageRepository";
import { IPlaceRepository } from "../repositories/places/IPlaceRepository";
import { IEventRepository } from "../repositories/events/IEventRepository";
import { IEvent, IPlace } from "../types/models";

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

        req.images = imageIds;
        next();
      } catch (error) {
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
            isOwner = place.user.toString() === userId;
            foundReference = place;
            break;
          }

          case "Event": {
            const event = await this.eventRepository.findById(reference, [
              "place",
              "place.user",
            ]);
            if (!event || !event.place) {
              APIResponse(
                res,
                null,
                `L'événement avec l'ID ${reference} n'existe pas`,
                404
              );
              return;
            }
            const place = event.place as IPlace;
            if (!place.user) {
              APIResponse(
                res,
                null,
                `Erreur lors de la vérification de propriété`,
                500
              );
              return;
            }
            isOwner = place.user.toString() === userId;
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
      } catch (error) {
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
