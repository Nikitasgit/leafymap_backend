import { Types } from "mongoose";
import GetReviewsUseCase from "@src/application/usecases/reviews/GetReviews.usecase";
import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import {
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("GetReviewsUseCase", () => {
  let reviewRepository: jest.Mocked<IReviewRepository>;
  let useCase: GetReviewsUseCase;

  beforeEach(() => {
    reviewRepository = {
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
    };
    useCase = new GetReviewsUseCase(reviewRepository);
  });

  it("returns reviews for a reference", async () => {
    const referenceId = mockObjectId();
    const authorId = mockObjectId();
    const reviews = [
      {
        id: mockObjectId(),
        author: { id: authorId, username: "alice" },
        rating: 5,
        comment: "Top",
        reference: referenceId,
        referenceType: "Place" as const,
        certified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    reviewRepository.findByReference.mockResolvedValue(reviews);

    const result = await useCase.execute({
      referenceId,
      referenceType: "Place",
      authorId,
    });

    expect(result).toEqual(reviews);
    expect(reviewRepository.findByReference).toHaveBeenCalledWith(
      ReferenceId.from(referenceId),
      "Place",
      UserId.from(authorId)
    );
  });
});
