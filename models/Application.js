const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: [true, "Please add an application type"],
      enum: ["event", "place", "artist", "other"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    details: {
      title: String,
      description: String,
      startDate: Date,
      endDate: Date,
      location: String,
      capacity: Number,
      price: Number,
      images: [String],
      // Additional fields based on application type
      eventType: {
        type: String,
        enum: ["workshop", "exhibition", "meetup", "other"],
      },
      placeType: {
        type: String,
        enum: ["studio", "gallery", "workshop", "exhibition", "other"],
      },
      artistType: {
        type: String,
        enum: ["painter", "sculptor", "photographer", "other"],
      },
    },
    documents: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    notes: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewDate: Date,
    reviewNotes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
