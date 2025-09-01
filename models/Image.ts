import { Schema, model } from "mongoose";
import { generateSignedUrlFromFullUrl } from "../utils/s3";

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reference: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "referenceType",
    },
    referenceType: {
      type: String,
      required: true,
      enum: ["Place", "User", "Event", "Message", "Review"],
    },
    type: {
      type: String,
      required: true,
      enum: ["profile", "cover", "gallery", "other"],
    },
    originalName: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
  },
  { timestamps: true }
);

imageSchema.virtual("signedUrl").get(function () {
  return this.url;
});

imageSchema.post(
  ["find", "findOne", "findOneAndUpdate"],
  async function (docs) {
    if (!docs) return;

    const processDoc = async (doc: any) => {
      if (doc && doc.url) {
        try {
          doc.url = await generateSignedUrlFromFullUrl(doc.url);
        } catch (error) {
          console.error("Error signing image URL:", error);
          doc.url = doc.url;
        }
      }
    };
    if (Array.isArray(docs)) {
      await Promise.all(docs.map(processDoc));
    } else {
      await processDoc(docs);
    }
  }
);

imageSchema.set("toJSON", { virtuals: true });
imageSchema.set("toObject", { virtuals: true });

export default model("Image", imageSchema);
