import { Types } from "mongoose";
import DeleteCommentUseCase from "@src/application/usecases/comments/DeleteComment.usecase";
import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import { Comment } from "@src/domain/entities/Comment.entity";
import {
  CommentId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("DeleteCommentUseCase", () => {
  let commentRepository: jest.Mocked<ICommentRepository>;
  let useCase: DeleteCommentUseCase;

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
    useCase = new DeleteCommentUseCase(commentRepository);
  });

  it("deletes a comment owned by the author", async () => {
    const commentId = mockObjectId();
    const authorId = mockObjectId();

    commentRepository.findById.mockResolvedValue(
      Comment.reconstitute({
        id: CommentId.from(commentId),
        authorId: UserId.from(authorId),
        content: "Hello",
        referenceId: ReferenceId.from(mockObjectId()),
        referenceType: "Review",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await useCase.execute({ commentId, authorId });

    expect(commentRepository.delete).toHaveBeenCalledWith(
      CommentId.from(commentId)
    );
  });

  it("rejects when the comment does not exist", async () => {
    commentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        commentId: mockObjectId(),
        authorId: mockObjectId(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.COMMENT_NOT_FOUND,
      statusCode: 404,
    });

    expect(commentRepository.delete).not.toHaveBeenCalled();
  });

  it("rejects when the author does not own the comment", async () => {
    const commentId = mockObjectId();
    const ownerId = mockObjectId();
    const otherUserId = mockObjectId();

    commentRepository.findById.mockResolvedValue(
      Comment.reconstitute({
        id: CommentId.from(commentId),
        authorId: UserId.from(ownerId),
        content: "Hello",
        referenceId: ReferenceId.from(mockObjectId()),
        referenceType: "Review",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await expect(
      useCase.execute({ commentId, authorId: otherUserId })
    ).rejects.toMatchObject({
      code: ERROR_CODES.COMMENT_FORBIDDEN,
      statusCode: 403,
    });

    expect(commentRepository.delete).not.toHaveBeenCalled();
  });
});
