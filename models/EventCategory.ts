import { Schema, model } from "mongoose";
import { IEventCategory } from "@/types/models/eventCategory";

const eventCategorySchema = new Schema<IEventCategory>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

export default model<IEventCategory>("EventCategory", eventCategorySchema);
