import { Types } from "mongoose";
import CreateReviewUseCase from "@src/application/usecases/reviews/CreateReview.usecase";
import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { IReviewTargetChecker } from "@src/domain/interfaces/IReviewTargetChecker";
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

describe("CreateReviewUseCase", () => {
  let reviewRepository: jest.Mocked<IReviewRepository>;
  let targetChecker: jest.Mocked<IReviewTargetChecker>;
  let ratingUpdater: jest.Mocked<IReviewRatingUpdater>;
  let useCase: CreateReviewUseCase;

  beforeEach(() => {
    reviewRepository = createMockReviewRepository();
    targetChecker = {
      exists: jest.fn(),
      getOwnerId: jest.fn(),
    };
    ratingUpdater = {
      recalculate: jest.fn(),
    };
    useCase = new CreateReviewUseCase(
      reviewRepository,
      targetChecker,
      ratingUpdater
    );
  });

  it("creates a review and recalculates rating", async () => {
    const authorId = mockObjectId();
    const referenceId = mockObjectId();
    const reviewId = mockObjectId();

    targetChecker.exists.mockResolvedValue(true);
    targetChecker.getOwnerId.mockResolvedValue(
      UserId.from(mockObjectId())
    );
    reviewRepository.findByAuthorAndReference.mockResolvedValue(null);
    reviewRepository.save.mockResolvedValue(ReviewId.from(reviewId));

    const result = await useCase.execute({
      authorId,
      rating: 4,
      comment: "Great",
      referenceId,
      referenceType: "Place",
    });

    expect(result).toEqual({ id: reviewId });
    expect(reviewRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: UserId.from(authorId),
        rating: 4,
        comment: "Great",
        referenceId: ReferenceId.from(referenceId),
        referenceType: "Place",
      })
    );
    expect(ratingUpdater.recalculate).toHaveBeenCalledWith(
      ReferenceId.from(referenceId),
      "Place"
    );
  });

  it("rejects when the reference does not exist", async () => {
    targetChecker.exists.mockResolvedValue(false);

    await expect(
      useCase.execute({
        authorId: mockObjectId(),
        rating: 4,
        referenceId: mockObjectId(),
        referenceType: "Place",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.REVIEW_REFERENCE_NOT_FOUND,
      statusCode: 404,
    });

    expect(reviewRepository.save).not.toHaveBeenCalled();
  });

  it("rejects reviewing own entity", async () => {
    const authorId = mockObjectId();
    const referenceId = mockObjectId();

    targetChecker.exists.mockResolvedValue(true);
    targetChecker.getOwnerId.mockResolvedValue(UserId.from(authorId));

    await expect(
      useCase.execute({
        authorId,
        rating: 4,
        referenceId,
        referenceType: "Event",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.REVIEW_OWN_ENTITY_FORBIDDEN,
      statusCode: 403,
    });

    expect(reviewRepository.save).not.toHaveBeenCalled();
  });

  it("rejects when a review already exists", async () => {
    const authorId = mockObjectId();
    const referenceId = mockObjectId();

    targetChecker.exists.mockResolvedValue(true);
    targetChecker.getOwnerId.mockResolvedValue(
      UserId.from(mockObjectId())
    );
    reviewRepository.findByAuthorAndReference.mockResolvedValue(
      Review.reconstitute({
        id: ReviewId.from(mockObjectId()),
        authorId: UserId.from(authorId),
        rating: 3,
        referenceId: ReferenceId.from(referenceId),
        referenceType: "Place",
        certified: false,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await expect(
      useCase.execute({
        authorId,
        rating: 5,
        referenceId,
        referenceType: "Place",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.REVIEW_ALREADY_EXISTS,
      statusCode: 409,
    });

    expect(reviewRepository.save).not.toHaveBeenCalled();
  });
});
