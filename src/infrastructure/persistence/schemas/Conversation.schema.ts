import { Schema, model, Types } from "mongoose";

export interface ConversationDocumentProps {
  _id?: Types.ObjectId;
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const conversationSchema = new Schema<ConversationDocumentProps>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: false,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

export const ConversationModel = model<ConversationDocumentProps>(
  "Conversation",
  conversationSchema
);

export default ConversationModel;
