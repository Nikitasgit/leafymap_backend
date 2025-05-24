const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Please add a message content"],
    },
    conversationType: {
      type: String,
      enum: ["direct", "event", "place", "application"],
      default: "direct",
    },
    context: {
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
      place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Place",
      },
      application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    },
    attachments: [
      {
        type: String, // URL to the attachment
        name: String,
        size: Number,
        mimeType: String,
      },
    ],
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for faster queries
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ conversationType: 1, context: 1 });

module.exports = mongoose.model("Message", messageSchema);
