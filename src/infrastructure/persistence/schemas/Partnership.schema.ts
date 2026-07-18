import { Schema, model, Types } from "mongoose";
import { PartnershipStatus } from "@src/domain/value-objects/PartnershipStatus.vo";

export interface PartnershipDocumentProps {
  _id?: Types.ObjectId;
  initiator: Types.ObjectId;
  collaborator: Types.ObjectId;
  status: PartnershipStatus;
  deleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const partnershipSchema = new Schema<PartnershipDocumentProps>(
  {
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

export default model<PartnershipDocumentProps>(
  "Partnership",
  partnershipSchema
);
