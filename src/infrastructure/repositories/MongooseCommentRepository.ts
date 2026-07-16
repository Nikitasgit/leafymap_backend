import {
  AdminCommentSummary,
  CommentListItem,
  ICommentRepository,
  SoftDeleteCommentParams,
} from "@src/domain/interfaces/ICommentRepository";
import { Comment } from "@src/domain/entities/Comment.entity";
import {
  CommentId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import { CommentMapper } from "@src/infrastructure/mappers/Comment.mapper";
import CommentModel, {
  CommentDocumentProps,
} from "@src/infrastructure/persistence/schemas/Comment.schema";
import { Types } from "mongoose";

type CommentDocumentWithId = CommentDocumentProps & { _id: Types.ObjectId };

type PopulatedAuthor = {
  _id?: Types.ObjectId;
  username?: string;
  image?: { urls?: unknown };
};

type CommentListDocument = {
  _id: Types.ObjectId;
  author: PopulatedAuthor | Types.ObjectId | null;
  content: string;
  reference: Types.ObjectId;
  referenceType: CommentReferenceType;
  createdAt?: Date;
  updatedAt?: Date;
};

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
    if (!comment.id) {
      return;
    }
    await CommentModel.updateOne(
      { _id: comment.id },
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
  ): Promise<CommentListItem[]> {
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
      .populate({ path: "author", select: "_id username image.urls" })
      .sort({ createdAt: -1 })
      .lean();

    return (documents as CommentListDocument[]).map((doc) => ({
      _id: doc._id.toString(),
      author: this.mapAuthor(doc.author),
      content: doc.content,
      reference: doc.reference.toString(),
      referenceType: doc.referenceType,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    }));
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
  ): Promise<AdminCommentSummary[]> {
    const documents = await CommentModel.find({
      author: new Types.ObjectId(authorId),
    })
      .select("_id content referenceType deleted createdAt")
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return documents.map((doc) => ({
      _id: doc._id.toString(),
      content: doc.content,
      referenceType: doc.referenceType,
      deleted: doc.deleted ?? false,
      createdAt: doc.createdAt ?? new Date(),
    }));
  }

  async softDelete(
    id: CommentId,
    params: SoftDeleteCommentParams
  ): Promise<void> {
    const update = params.deleted
      ? {
          deleted: true,
          deletedAt: new Date(),
          deletedBy: new Types.ObjectId(params.adminId),
          deleteReason: params.reason,
        }
      : {
          deleted: false,
          deletedAt: undefined,
          deletedBy: undefined,
          deleteReason: undefined,
        };

    await CommentModel.updateOne({ _id: id }, update).exec();
  }

  private mapAuthor(
    author: PopulatedAuthor | Types.ObjectId | null
  ): CommentListItem["author"] {
    if (!author || author instanceof Types.ObjectId) {
      return null;
    }
    if (!author._id) {
      return null;
    }
    return {
      _id: author._id.toString(),
      username: author.username,
      image: author.image,
    };
  }
}

export default MongooseCommentRepository;
