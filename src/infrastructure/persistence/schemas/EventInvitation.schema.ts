import { Schema, model, Types } from "mongoose";
import { EventInvitationStatus } from "@src/domain/value-objects/EventInvitationStatus.vo";

export interface EventInvitationDocumentProps {
  _id?: Types.ObjectId;
  event: Types.ObjectId;
  initiator: Types.ObjectId;
  collaborator: Types.ObjectId;
  status: EventInvitationStatus;
  deleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const eventInvitationSchema = new Schema<EventInvitationDocumentProps>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    initiator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "refused", "cancelled", "completed"],
      required: true,
      default: "pending",
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<EventInvitationDocumentProps>(
  "EventInvitation",
  eventInvitationSchema
);
