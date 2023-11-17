const express = require("express");
const config = require("config");
const BotUser = require("../models/BotUser");
const TelegramBot = require("node-telegram-bot-api");
const router = express.Router({ mergeParams: true });

const bot = new TelegramBot(config.botAPI, {
  polling: {
    interval: 300,
    autoStart: true,
  },
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  if (!(await BotUser.findOne({ userId }))) {
    await bot.sendMessage(
      chatId,
      "Пожалуйста, введите пароль для доступа к боту."
    );
  }
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const password = msg.text;

  if (password === "ваш_правильный_пароль") {
    if (!(await BotUser.findOne({ userId }))) {
      await BotUser.create({ chatId });
    }
    await bot.sendMessage(chatId, "Добро пожаловать!");
  } else {
    await bot.sendMessage(chatId, "Неправильный пароль. Попробуйте еще раз.");
  }
});

bot.on("left_chat_member", async (msg) => {
  const chatId = msg.chat.id;

  await BotUser.findOneAndDelete({ chatId });
});

router.post("/send", async (req, res) => {
  try {
    const { text } = req.body;

    const allUsers = await BotUser.find();

    allUsers.map(async (user) => {
      await bot.sendMessage(user.chatId, text);
    });

    res.status(200).json("Заказ успешно отправлен в телеграм");
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
