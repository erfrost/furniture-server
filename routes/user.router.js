const express = require("express");
const router = express.Router({ mergeParams: true });
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth.middleware");
const User = require("../models/User");

router.get("/info", auth, async (req, res) => {
  try {
    const { _id } = req.user;

    const currentUser = await User.findOne({ _id });

    res.status(200).json(currentUser);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/changePassword", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(200).json({ message: "Не передан пароль" });
    }

    const currentUser = await User.findOne({ _id });
    if (!currentUser) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    currentUser.password = newHashedPassword;

    await currentUser.save();

    res.status(200).json(currentUser);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
