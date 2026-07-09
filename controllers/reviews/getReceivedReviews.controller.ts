import {
  IGetReviewsAction,
  DEFAULT_REVIEWS_PROJECT,
} from "@/actions/reviews";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import { Controller, createController, requireAuth } from "@/utils/controllerFactory";

function getPlaceIdFromUser(user: { place?: unknown } | null): string | null {
  if (!user?.place) return null;
  const place = user.place;
  if (typeof place === "string") return place;
  if (typeof place === "object" && place !== null && "_id" in place) {
    return String((place as { _id: unknown })._id);
  }
  return null;
}

const GetReceivedReviewsController = (
  getReviewsAction: IGetReviewsAction,
  userRepository: IUserRepository
): Controller =>
  createController({
    execute: async (req) => {
      const userId = requireAuth(req).id;
      const user = await userRepository.findById(userId, ["_id", "place"]);
      const placeId = user ? getPlaceIdFromUser(user) : null;

      if (!placeId) {
        return { reviews: [], noPlace: true as const };
      }

      const reviews = await getReviewsAction.execute({
        filters: { reference: placeId, referenceType: "Place" },
        project: DEFAULT_REVIEWS_PROJECT,
      });
      return { reviews, noPlace: false as const };
    },
    successMessage: (result) =>
      result.noPlace
        ? "Aucun lieu associé à votre compte"
        : "Avis reçus récupérés avec succès",
    mapResult: ({ reviews }) => ({ reviews }),
  });

export default GetReceivedReviewsController;
