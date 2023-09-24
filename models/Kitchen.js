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
    specifications: {
      type: Array,
      required: true,
    },
    advantages: {
      type: String,
      required: true,
    },
    photo_names: {
      type: Array,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Kitchen", schema);
