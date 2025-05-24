const mongoose = require("mongoose");
const { Schema } = mongoose;

const placeCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const PlaceCategory = mongoose.model("PlaceCategory", placeCategorySchema);

module.exports = PlaceCategory;
