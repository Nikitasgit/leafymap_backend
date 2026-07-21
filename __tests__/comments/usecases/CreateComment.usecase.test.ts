import { Types } from "mongoose";
import CreateCommentUseCase from "@src/application/usecases/comments/CreateComment.usecase";
import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import { ICommentReferenceChecker } from "@src/domain/interfaces/ICommentReferenceChecker";
import {
  CommentId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("CreateCommentUseCase", () => {
  let commentRepository: jest.Mocked<ICommentRepository>;
  let referenceChecker: jest.Mocked<ICommentReferenceChecker>;
  let useCase: CreateCommentUseCase;

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
    referenceChecker = {
      exists: jest.fn(),
    };
    useCase = new CreateCommentUseCase(commentRepository, referenceChecker);
  });

  it("creates a comment and returns its id", async () => {
    const authorId = mockObjectId();
    const referenceId = mockObjectId();
    const commentId = mockObjectId();

    referenceChecker.exists.mockResolvedValue(true);
    commentRepository.save.mockResolvedValue(CommentId.from(commentId));

    const result = await useCase.execute({
      authorId,
      content: "Great review",
      referenceId,
      referenceType: "Review",
    });

    expect(result).toEqual({ id: commentId });
    expect(referenceChecker.exists).toHaveBeenCalledWith(
      ReferenceId.from(referenceId),
      "Review"
    );
    expect(commentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: UserId.from(authorId),
        content: "Great review",
        referenceId: ReferenceId.from(referenceId),
        referenceType: "Review",
      })
    );
  });

  it("rejects when the reference does not exist", async () => {
    referenceChecker.exists.mockResolvedValue(false);

    await expect(
      useCase.execute({
        authorId: mockObjectId(),
        content: "Great review",
        referenceId: mockObjectId(),
        referenceType: "Image",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.COMMENT_REFERENCE_NOT_FOUND,
    });

    expect(commentRepository.save).not.toHaveBeenCalled();
  });

  it("rejects Comment reference type", async () => {
    await expect(
      useCase.execute({
        authorId: mockObjectId(),
        content: "Reply",
        referenceId: mockObjectId(),
        referenceType: "Comment",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.COMMENT_REFERENCE_UNSUPPORTED,
    });

    expect(referenceChecker.exists).not.toHaveBeenCalled();
    expect(commentRepository.save).not.toHaveBeenCalled();
  });
});
