import {
  ICommentRepository,
  SoftDeleteCommentParams,
} from "@src/domain/interfaces/ICommentRepository";
import { Comment } from "@src/domain/entities/Comment.entity";
import {
  AdminCommentSummaryReadModel,
  CommentListItemReadModel,
} from "@src/domain/read-models/comment.read-models";
import {
  CommentId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import { CommentMapper } from "@src/infrastructure/mappers/Comment.mapper";
import { CommentReadMapper } from "@src/infrastructure/read-mappers/Comment.read-mapper";
import CommentModel, {
  CommentDocumentProps,
} from "@src/infrastructure/persistence/schemas/Comment.schema";
import { assertPersistedId } from "@src/infrastructure/persistence/utils/assertPersistedId";
import { buildSoftDeleteUpdate } from "@src/infrastructure/persistence/utils/buildSoftDeleteUpdate";
import { userWithImagePopulate } from "@src/infrastructure/persistence/utils/populatePresets";
import { Types } from "mongoose";

type CommentDocumentWithId = CommentDocumentProps & { _id: Types.ObjectId };
export const COMMENT_AUTHOR_POPULATE = userWithImagePopulate(
  "author",
  "_id username image"
);

class MongooseCommentRepository implements ICommentRepository {
  async save(comment: Comment): Promise<CommentId> {
    const document = await CommentModel.create(
      CommentMapper.toPersistence(comment)
    );
    return CommentId.from(document._id.toString());
  }

  async findById(id: CommentId): Promise<Comment | null> {
    const document = await CommentModel.findById(id).lean();
    if (!document) {
      return null;
    }
    return CommentMapper.toDomain(document as CommentDocumentWithId);
  }

  async update(comment: Comment): Promise<void> {
    const id = assertPersistedId("comment", comment.id);
    await CommentModel.updateOne(
      { _id: id },
      {
        content: comment.content,
        updatedAt: comment.updatedAt,
      }
    ).exec();
  }

  async delete(id: CommentId): Promise<void> {
    await CommentModel.findByIdAndDelete(id).exec();
  }

  async findByReference(
    referenceId: ReferenceId,
    referenceType: CommentReferenceType,
    authorId?: UserId
  ): Promise<CommentListItemReadModel[]> {
    const filter: Record<string, unknown> = {
      reference: new Types.ObjectId(referenceId),
      referenceType,
      deleted: false,
    };
    if (authorId) {
      filter.author = new Types.ObjectId(authorId);
    }

    const documents = await CommentModel.find(filter)
      .select("_id author content reference referenceType createdAt updatedAt")
      .populate(COMMENT_AUTHOR_POPULATE)
      .sort({ createdAt: -1 })
      .lean();

    return CommentReadMapper.toListItems(documents);
  }

  async findIdsByReferences(
    referenceIds: ReferenceId[],
    referenceType: CommentReferenceType
  ): Promise<CommentId[]> {
    if (referenceIds.length === 0) {
      return [];
    }

    const documents = await CommentModel.find({
      reference: { $in: referenceIds.map((id) => new Types.ObjectId(id)) },
      referenceType,
    })
      .select("_id")
      .lean();

    return documents.map((doc) => CommentId.from(doc._id.toString()));
  }

  async deleteManyByIds(ids: CommentId[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    await CommentModel.deleteMany({
      _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
    }).exec();
  }

  async findByAuthor(
    authorId: UserId,
    limit = 50
  ): Promise<AdminCommentSummaryReadModel[]> {
    const documents = await CommentModel.find({
      author: new Types.ObjectId(authorId),
    })
      .select("_id content referenceType deleted createdAt")
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return CommentReadMapper.toAdminSummaries(documents);
  }

  async softDelete(
    id: CommentId,
    params: SoftDeleteCommentParams
  ): Promise<void> {
    await CommentModel.updateOne(
      { _id: id },
      buildSoftDeleteUpdate({
        deleted: params.deleted,
        adminId: params.adminId,
        reason: params.reason,
      })
    ).exec();
  }
}

export default MongooseCommentRepository;
