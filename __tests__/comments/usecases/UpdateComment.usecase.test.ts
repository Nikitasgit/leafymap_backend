import { Types } from "mongoose";
import UpdateCommentUseCase from "@src/application/usecases/comments/UpdateComment.usecase";
import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import { Comment } from "@src/domain/entities/Comment.entity";
import {
  CommentId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("UpdateCommentUseCase", () => {
  let commentRepository: jest.Mocked<ICommentRepository>;
  let useCase: UpdateCommentUseCase;

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
    useCase = new UpdateCommentUseCase(commentRepository);
  });

  it("updates a comment owned by the author", async () => {
    const commentId = mockObjectId();
    const authorId = mockObjectId();
    const existing = Comment.reconstitute({
      id: CommentId.from(commentId),
      authorId: UserId.from(authorId),
      content: "Old",
      referenceId: ReferenceId.from(mockObjectId()),
      referenceType: "Review",
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    commentRepository.findById.mockResolvedValue(existing);

    await useCase.execute({
      commentId,
      authorId,
      content: "New content",
    });

    expect(commentRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: CommentId.from(commentId),
        content: "New content",
      })
    );
  });

  it("rejects when the comment does not exist", async () => {
    commentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        commentId: mockObjectId(),
        authorId: mockObjectId(),
        content: "New content",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.COMMENT_NOT_FOUND,
      statusCode: 404,
    });

    expect(commentRepository.update).not.toHaveBeenCalled();
  });

  it("rejects when the author does not own the comment", async () => {
    const commentId = mockObjectId();
    const ownerId = mockObjectId();
    const otherUserId = mockObjectId();

    commentRepository.findById.mockResolvedValue(
      Comment.reconstitute({
        id: CommentId.from(commentId),
        authorId: UserId.from(ownerId),
        content: "Old",
        referenceId: ReferenceId.from(mockObjectId()),
        referenceType: "Review",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await expect(
      useCase.execute({
        commentId,
        authorId: otherUserId,
        content: "New content",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.COMMENT_FORBIDDEN,
      statusCode: 403,
    });

    expect(commentRepository.update).not.toHaveBeenCalled();
  });
});
