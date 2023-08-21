const { Schema, model } = require("mongoose");

const schema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  photo_name: {
    type: String,
    required: true,
  },
  subcategories: [
    {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
    },
  ],
});

module.exports = model("Category", schema);
