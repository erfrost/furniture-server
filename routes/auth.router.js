const express = require("express");
const router = express.Router({ mergeParams: true });
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { check, validationResult } = require("express-validator");
const {
  generate,
  save,
  validateRefresh,
  findToken,
  validateAutoAuth,
} = require("../services/tokenService");
const { passwordValidate } = require("../services/regexp");

router.post("/adminAuth", async (req, res) => {
  try {
    const { email, password } = req.body;

    const currentUser = await User.findOne({ email });

    if (!currentUser) {
      return res.status(201).json({
        message: "Неверное имя пользователя или пароль",
      });
    }

    const isPasswordEqual = await bcrypt.compare(
      password,
      currentUser.password
    );
    if (!isPasswordEqual) {
      return res.status(201).json({
        message: "Неверное имя пользователя или пароль",
      });
    }

    const tokens = generate({ _id: currentUser._id }, false);
    await save(currentUser._id, tokens.refreshToken, tokens.autoAuthToken);

    res.status(200).json(tokens);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/signUp", [
  check("email", "Некорректный email").isEmail(),
  check("password", "Пароль должен содержать минимум 8 символов").isLength({
    min: 8,
    max: 64,
  }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Проверьте правильность введеных данных",
          errors: errors.array(),
        });
      }

      const { email, password, autoAuth } = req.body;

      if (!passwordValidate(password)) {
        return res.status(201).json({
          message:
            "Пароль должен содержать только латинские символы, минимум 1 цифру и минимум 1 символ в верхнем регистре",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(201).json({
          message: "Данный email уже зарегистрирован",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = await User.create({
        email,
        password: hashedPassword,
        role: "user",
        cart: [],
        orders: [],
      });

      const tokens = generate({ _id: newUser._id }, autoAuth);

      await save(newUser._id, tokens.refreshToken, tokens.autoAuthToken);

      res.status(201).json({ ...tokens, userId: newUser._id });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  },
]);

router.post("/signInWithCookie", async (req, res) => {
  try {
    const autoAuthToken = req.cookies.autoAuthToken || "";
    const cartItems = req.cookies.cartItems || [];

    if (!autoAuthToken) {
      return res.status(401).json({ message: "В теле запроса нет токена" });
    }

    const data = validateAutoAuth(autoAuthToken);
    if (!data) {
      return res.status(401).json({ message: "Токен недействителен" });
    }

    const currentUser = await User.findOne({ _id: data._id });
    if (!currentUser) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }
    cartItems.map(async (item) => {
      currentUser.cart.push(item);
    });
    await currentUser.save();

    const tokens = generate({ _id: currentUser._id }, true);
    await save(currentUser._id, tokens.refreshToken, tokens.autoAuthToken);

    res.status(200).json({ ...tokens, userId: currentUser._id });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/signInWithPassword", async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Некорректный email" });
    }

    const { email, password, autoAuth } = req.body;

    const currentUser = await User.findOne({ email });

    if (!currentUser) {
      return res.status(201).json({
        message: "Неверное имя пользователя или пароль",
      });
    }

    const isPasswordEqual = await bcrypt.compare(
      password,
      currentUser.password
    );
    if (!isPasswordEqual) {
      return res.status(201).json({
        message: "Неверное имя пользователя или пароль",
      });
    }

    const tokens = generate({ _id: currentUser._id }, autoAuth);
    await save(currentUser._id, tokens.refreshToken, tokens.autoAuthToken);

    res.status(200).json({ ...tokens, userId: currentUser._id });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

function isTokenInvalid(data, dbToken) {
  return !data || !dbToken || data._id !== dbToken?.user?.toString();
}

router.post("/token", async (req, res) => {
  try {
    const { refresh_token: refreshToken } = req.body;
    const data = validateRefresh(refreshToken);
    const dbToken = await findToken(refreshToken);

    if (isTokenInvalid(data, dbToken)) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const tokens = generate({ _id: data._id });
    await save(data._id, tokens.refreshToken);

    res.status(200).json({ ...tokens, userId: data._id });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
