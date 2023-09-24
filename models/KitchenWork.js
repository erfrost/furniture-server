const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    photo_name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("KitchenWork", schema);
