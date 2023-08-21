const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    locality: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    house: {
      type: String,
      required: true,
    },
    entrance: {
      type: Number,
      required: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    apartmentNumber: {
      type: Number,
      required: true,
    },
    buyer: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Order", schema);
