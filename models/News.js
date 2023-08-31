const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    photo_name: {
      type: String,
      required: true,
    },
    category_id: {
      type: String,
    },
    subcategory_id: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("News", schema);
