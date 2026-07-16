import { Comment } from "@src/domain/entities/Comment.entity";
import {
  CommentId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import { CommentDocumentProps } from "@src/infrastructure/persistence/schemas/Comment.schema";
import { Types } from "mongoose";

export class CommentMapper {
  static toDomain(
    doc: CommentDocumentProps & { _id: Types.ObjectId }
  ): Comment {
    return Comment.reconstitute({
      id: CommentId.from(doc._id.toString()),
      authorId: UserId.from(doc.author.toString()),
      content: doc.content,
      referenceId: ReferenceId.from(doc.reference.toString()),
      referenceType: CommentReferenceType.from(doc.referenceType),
      deleted: doc.deleted ?? false,
      deletedAt: doc.deletedAt,
      deletedBy: doc.deletedBy
        ? UserId.from(doc.deletedBy.toString())
        : undefined,
      deleteReason: doc.deleteReason,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  static toPersistence(
    comment: Comment
  ): Omit<CommentDocumentProps, "_id"> {
    return {
      author: new Types.ObjectId(comment.authorId),
      content: comment.content,
      reference: new Types.ObjectId(comment.referenceId),
      referenceType: comment.referenceType,
      deleted: comment.deleted,
      deletedAt: comment.deletedAt,
      deletedBy: comment.deletedBy
        ? new Types.ObjectId(comment.deletedBy)
        : undefined,
      deleteReason: comment.deleteReason,
    };
  }
}
