import { Types } from "mongoose";
import DeleteReviewUseCase from "@src/application/usecases/reviews/DeleteReview.usecase";
import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { IReviewRatingUpdater } from "@src/domain/interfaces/IReviewRatingUpdater";
import { Review } from "@src/domain/entities/Review.entity";
import {
  ReferenceId,
  ReviewId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

const createMockReviewRepository = (): jest.Mocked<IReviewRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByAuthorAndReference: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByReference: jest.fn(),
  findByAuthorWithPlaceReference: jest.fn(),
  findIdsByReferences: jest.fn(),
  deleteManyByReferences: jest.fn(),
  findRatingsByReference: jest.fn(),
  findByAuthorAdmin: jest.fn(),
  softDelete: jest.fn(),
});

describe("DeleteReviewUseCase", () => {
  let reviewRepository: jest.Mocked<IReviewRepository>;
  let ratingUpdater: jest.Mocked<IReviewRatingUpdater>;
  let useCase: DeleteReviewUseCase;

  beforeEach(() => {
    reviewRepository = createMockReviewRepository();
    ratingUpdater = { recalculate: jest.fn() };
    useCase = new DeleteReviewUseCase(reviewRepository, ratingUpdater);
  });

  it("deletes a review owned by the author and recalculates rating", async () => {
    const reviewId = mockObjectId();
    const authorId = mockObjectId();
    const referenceId = mockObjectId();

    reviewRepository.findById.mockResolvedValue(
      Review.reconstitute({
        id: ReviewId.from(reviewId),
        authorId: UserId.from(authorId),
        rating: 4,
        referenceId: ReferenceId.from(referenceId),
        referenceType: "Event",
        certified: false,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await useCase.execute({ reviewId, authorId });

    expect(reviewRepository.delete).toHaveBeenCalledWith(
      ReviewId.from(reviewId)
    );
    expect(ratingUpdater.recalculate).toHaveBeenCalledWith(
      ReferenceId.from(referenceId),
      "Event"
    );
  });

  it("rejects when the review does not exist", async () => {
    reviewRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        reviewId: mockObjectId(),
        authorId: mockObjectId(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.REVIEW_NOT_FOUND,
      statusCode: 404,
    });

    expect(reviewRepository.delete).not.toHaveBeenCalled();
  });

  it("rejects when the author does not own the review", async () => {
    const reviewId = mockObjectId();
    const ownerId = mockObjectId();

    reviewRepository.findById.mockResolvedValue(
      Review.reconstitute({
        id: ReviewId.from(reviewId),
        authorId: UserId.from(ownerId),
        rating: 4,
        referenceId: ReferenceId.from(mockObjectId()),
        referenceType: "Place",
        certified: false,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await expect(
      useCase.execute({ reviewId, authorId: mockObjectId() })
    ).rejects.toMatchObject({
      code: ERROR_CODES.REVIEW_FORBIDDEN,
      statusCode: 403,
    });

    expect(reviewRepository.delete).not.toHaveBeenCalled();
  });
});
