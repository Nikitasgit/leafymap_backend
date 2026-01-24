import { Schema, model } from "mongoose";
import AwsService from "@/services/awsService";

const awsService = new AwsService();

const imageSchema = new Schema(
  {
    urls: {
      original: { type: String, required: true },
      thumbnail: { type: String, required: true },
      medium: { type: String, required: true },
    },
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
      enum: ["Place", "User", "Event", "Comment", "Review"],
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

imageSchema.virtual("signedUrls").get(function () {
  return this.urls;
});

imageSchema.post(
  ["find", "findOne", "findOneAndUpdate"],
  async function (docs) {
    if (!docs) return;

    const processDoc = async (doc: any) => {
      if (doc && doc.urls) {
        try {
          doc.urls.original = await awsService.generateSignedUrlFromFullUrl(
            doc.urls.original
          );
          doc.urls.thumbnail = await awsService.generateSignedUrlFromFullUrl(
            doc.urls.thumbnail
          );
          doc.urls.medium = await awsService.generateSignedUrlFromFullUrl(
            doc.urls.medium
          );
        } catch (error) {
          console.error("Error signing image URLs:", error);
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
