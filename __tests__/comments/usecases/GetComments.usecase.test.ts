import { Types } from "mongoose";
import GetCommentsUseCase from "@src/application/usecases/comments/GetComments.usecase";
import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import {
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("GetCommentsUseCase", () => {
  let commentRepository: jest.Mocked<ICommentRepository>;
  let useCase: GetCommentsUseCase;

  beforeEach(() => {
    commentRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByReference: jest.fn(),
      findIdsByReferences: jest.fn(),
      deleteManyByIds: jest.fn(),
      findByAuthor: jest.fn(),
      softDelete: jest.fn(),
    };
    useCase = new GetCommentsUseCase(commentRepository);
  });

  it("returns comments for a reference", async () => {
    const referenceId = mockObjectId();
    const comments = [
      {
        _id: mockObjectId(),
        author: { _id: mockObjectId(), username: "alice" },
        content: "Hello",
        reference: referenceId,
        referenceType: "Review" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    commentRepository.findByReference.mockResolvedValue(comments);

    const result = await useCase.execute({
      referenceId,
      referenceType: "Review",
    });

    expect(result).toEqual(comments);
    expect(commentRepository.findByReference).toHaveBeenCalledWith(
      ReferenceId.from(referenceId),
      "Review",
      undefined
    );
  });

  it("filters by author when provided", async () => {
    const referenceId = mockObjectId();
    const authorId = mockObjectId();
    commentRepository.findByReference.mockResolvedValue([]);

    await useCase.execute({
      referenceId,
      referenceType: "Image",
      authorId,
    });

    expect(commentRepository.findByReference).toHaveBeenCalledWith(
      ReferenceId.from(referenceId),
      "Image",
      UserId.from(authorId)
    );
  });
});
