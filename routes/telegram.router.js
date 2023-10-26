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
  console.log(chatId);

  await BotUser.create({ chatId });

  await bot.sendMessage(chatId, "Бот запущен");
});

bot.on("left_chat_member", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.left_chat_member.id;
  console.log(`Пользователь ${userId} покинул чат ${chatId}`);

  await BotUser.findOneAndDelete({ chatId, userId });

  await bot.sendMessage(chatId, "Вы покинули бота");
});

router.post("/newOrder", async (req, res) => {
  try {
    const { text } = req.body;
    console.log(req.body);
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
