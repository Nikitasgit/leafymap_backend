import { IMessageRepository } from "../../repositories/messages/IMessageRepository";
import { CreateMessageInput } from "../../validations/messageValidations";
import Review from "../../models/Review";
import { Types } from "mongoose";
import { isUserOwnerOfReference } from "../../utils/ownershipCheck";

export interface ICreateReviewMessageAction {
  execute(params: {
    messageData: CreateMessageInput;
    authorId: string;
  }): Promise<{ _id: string }>;
}

const CreateReviewMessageAction = (
  messageRepository: IMessageRepository
): ICreateReviewMessageAction => ({
  execute: async ({ messageData, authorId }) => {
    const { reference, content } = messageData;
    const review = await Review.findById(reference).lean();
    if (!review) {
      throw new Error("Review not found");
    }

    // Verify that the user is the owner of the place/event referenced by the review
    const isOwner = await isUserOwnerOfReference(
      authorId,
      review.reference.toString(),
      review.referenceType
    );

    if (!isOwner) {
      throw new Error("You are not authorized to respond to this review");
    }

    // Create the message
    const messageId = await messageRepository.create({
      author: new Types.ObjectId(authorId),
      content,
      reference: new Types.ObjectId(reference),
      referenceType: "Review",
    });

    return { _id: messageId.toString() };
  },
});

export default CreateReviewMessageAction;
