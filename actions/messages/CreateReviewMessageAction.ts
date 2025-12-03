import { IMessageRepository } from "../../repositories/messages/IMessageRepository";
import { CreateMessageInput } from "../../validations/messageValidations";
import Place from "../../models/Place";
import Event from "../../models/Event";
import Review from "../../models/Review";
import { Types } from "mongoose";
import { IPlace } from "../../types/models/place";

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
    let isOwner = false;

    switch (review.referenceType) {
      case "Place": {
        const place = await Place.findById(review.reference);
        if (place && place.user.toString() === authorId) {
          isOwner = true;
        }
        break;
      }
      case "Event": {
        const event = await Event.findById(review.reference).populate<{
          place: IPlace;
        }>("place");
        if (
          event &&
          event.place &&
          (event.place as IPlace).user.toString() === authorId
        ) {
          isOwner = true;
        }
        break;
      }
      case "User": {
        // For reviews on a User, only the user themselves can respond
        if (review.reference.toString() === authorId) {
          isOwner = true;
        }
        break;
      }
    }

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
