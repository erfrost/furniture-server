const { Schema, model } = require("mongoose");

const schema = new Schema({
  chatId: {
    type: Number,
    required: true,
    unique: true,
  },
});

module.exports = model("BotUser", schema);
