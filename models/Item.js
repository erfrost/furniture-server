const { Schema, model } = require("mongoose");

const schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category_id: {
    type: String,
    required: true,
  },
  subcategory_id: {
    type: String,
    required: true,
  },
  secondary_categories: {
    type: Array,
    required: true,
  },
  promotion: {
    type: Boolean,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: Number,
    required: true,
  },
  cashPrice: {
    type: Number,
    required: true,
  },
  photo_names: {
    type: Array,
    required: true,
  },
  specifications: {
    type: Array,
    required: true,
  },
  furnisherId: {
    type: String,
  },
  vendor_code: {
    type: String,
  },
  availability: {
    type: Boolean,
    required: true,
  },
});

schema.index({ title: "text", price: "number" });

module.exports = model("Item", schema);
