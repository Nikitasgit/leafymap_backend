import { Schema, model, Types } from "mongoose";

export interface EventCategoryDocumentProps {
  _id?: Types.ObjectId;
  name: string;
}

const eventCategorySchema = new Schema<EventCategoryDocumentProps>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

export const EventCategoryModel = model<EventCategoryDocumentProps>(
  "EventCategory",
  eventCategorySchema
);

export default EventCategoryModel;
