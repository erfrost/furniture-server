const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/auth.middleware");
const Feedback = require("../models/Feedback");
const { descriptionValidate, titleValidate } = require("../services/regexp");

router.get("/", async (req, res) => {
  try {
    const allFeedbacks = await Feedback.find();

    res.status(200).json(allFeedbacks);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, text } = req.body;
    if (!name || !text) {
      return res.status(400).json({ message: "Не все поля поля заполнены" });
    }
    if (name.length > 50 || text.length > 1000) {
      return res.status(404).json({ message: "Превышен лимит по символам" });
    }
    if (!titleValidate(name) || !descriptionValidate(text)) {
      return res.status(404).json({
        message: "Имя или текст отзыва содержат недопустимые символы",
      });
    }
    await Feedback.create({
      name,
      text,
    });

    res.status(200).json({ message: "Отзыв успешно добавлен" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:feedback_id", async (req, res) => {
  try {
    const feedbackId = req.params.feedback_id;

    if (!feedbackId) {
      return res
        .status(400)
        .json({ message: "Не передан id отзыва для удаления" });
    }

    const currentFeedback = await Feedback.findOne({ _id: feedbackId });
    if (!currentFeedback) {
      return res
        .status(400)
        .json({ message: "Отзыв с указанным id не найден" });
    }

    await currentFeedback.delete();

    res.status(200).json({ message: "Отзыв успешно удален" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
