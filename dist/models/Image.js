"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const s3_1 = require("../utils/s3");
const imageSchema = new mongoose_1.Schema({
    urls: {
        original: { type: String, required: true },
        thumbnail: { type: String, required: true },
        medium: { type: String, required: true },
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    reference: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { timestamps: true });
imageSchema.virtual("signedUrls").get(function () {
    return this.urls;
});
imageSchema.post(["find", "findOne", "findOneAndUpdate"], async function (docs) {
    if (!docs)
        return;
    const processDoc = async (doc) => {
        if (doc && doc.urls) {
            try {
                doc.urls.original = await (0, s3_1.generateSignedUrlFromFullUrl)(doc.urls.original);
                doc.urls.thumbnail = await (0, s3_1.generateSignedUrlFromFullUrl)(doc.urls.thumbnail);
                doc.urls.medium = await (0, s3_1.generateSignedUrlFromFullUrl)(doc.urls.medium);
            }
            catch (error) {
                console.error("Error signing image URLs:", error);
            }
        }
    };
    if (Array.isArray(docs)) {
        await Promise.all(docs.map(processDoc));
    }
    else {
        await processDoc(docs);
    }
});
imageSchema.set("toJSON", { virtuals: true });
imageSchema.set("toObject", { virtuals: true });
exports.default = (0, mongoose_1.model)("Image", imageSchema);
