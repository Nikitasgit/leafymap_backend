import { RequestHandler } from "express";
import {
  createReviewSchema,
  getReviewsQuerySchema,
  updateReviewSchema,
} from "@src/api/dto/reviews/review.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type CreateReviewUseCase from "@src/application/usecases/reviews/CreateReview.usecase";
import type DeleteReviewUseCase from "@src/application/usecases/reviews/DeleteReview.usecase";
import type GetMyReviewsUseCase from "@src/application/usecases/reviews/GetMyReviews.usecase";
import type GetReceivedReviewsUseCase from "@src/application/usecases/reviews/GetReceivedReviews.usecase";
import type GetReviewsUseCase from "@src/application/usecases/reviews/GetReviews.usecase";
import type UpdateReviewUseCase from "@src/application/usecases/reviews/UpdateReview.usecase";

class ReviewsController extends BaseHttpController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly getReviewsUseCase: GetReviewsUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
    private readonly getMyReviewsUseCase: GetMyReviewsUseCase,
    private readonly getReceivedReviewsUseCase: GetReceivedReviewsUseCase
  ) {
    super();
  }

  create(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const { rating, comment, reference, referenceType } = validateOrThrow(
          createReviewSchema,
          req.body
        );
        return this.createReviewUseCase.execute({
          authorId: requireAuth(req).id,
          rating,
          comment,
          referenceId: reference,
          referenceType,
        });
      },
      successMessage: "Review créé avec succès",
      successStatus: 201,
      mapResult: (result) => ({ id: result.id }),
    });
  }

  list(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const filters = validateOrThrow(getReviewsQuerySchema, req.query);
        const reviews = await this.getReviewsUseCase.execute({
          referenceId: filters.reference,
          referenceType: filters.referenceType,
          authorId: filters.author,
        });
        return { reviews };
      },
      successMessage: "Reviews récupérées avec succès",
    });
  }

  update(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const data = validateOrThrow(updateReviewSchema, req.body);
        await this.updateReviewUseCase.execute({
          reviewId: requireObjectIdParam(req, "reviewId"),
          authorId: requireAuth(req).id,
          rating: data.rating,
          comment: data.comment,
        });
      },
      successMessage: "Review modifié avec succès",
    });
  }

  delete(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.deleteReviewUseCase.execute({
          reviewId: requireObjectIdParam(req, "reviewId"),
          authorId: requireAuth(req).id,
        });
      },
      successMessage: "Review supprimé avec succès",
    });
  }

  listMine(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const reviews = await this.getMyReviewsUseCase.execute({
          authorId: requireAuth(req).id,
        });
        return { reviews };
      },
      successMessage: "Avis rédigés récupérés avec succès",
    });
  }

  listReceived(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        return this.getReceivedReviewsUseCase.execute({
          userId: requireAuth(req).id,
        });
      },
      successMessage: (result) =>
        result.noPlace
          ? "Aucun lieu associé à votre compte"
          : "Avis reçus récupérés avec succès",
      mapResult: ({ reviews }) => ({ reviews }),
    });
  }
}

export default ReviewsController;
