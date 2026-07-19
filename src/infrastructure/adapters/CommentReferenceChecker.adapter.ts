import { ICommentReferenceChecker } from "@src/domain/interfaces/ICommentReferenceChecker";
import { IImageRepository } from "@src/domain/interfaces/IImageRepository";
import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import { ImageId, ReferenceId, ReviewId } from "@src/domain/value-objects/ObjectId.vo";

class CommentReferenceCheckerAdapter implements ICommentReferenceChecker {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly reviewRepository: IReviewRepository
  ) {}

  async exists(
    referenceId: ReferenceId,
    referenceType: CommentReferenceType
  ): Promise<boolean> {
    switch (referenceType) {
      case "Image": {
        const image = await this.imageRepository.findById(
          ImageId.from(referenceId)
        );
        return image !== null;
      }
      case "Review": {
        const review = await this.reviewRepository.findById(
          ReviewId.from(referenceId)
        );
        return review !== null;
      }
      case "Comment":
        return false;
    }
  }
}

export default CommentReferenceCheckerAdapter;
