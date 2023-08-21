const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    cart: {
      type: Array,
      required: true,
    },
    orders: {
      type: Array,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", schema);
