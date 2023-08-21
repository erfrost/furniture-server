const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/auth.middleware");
const User = require("../models/User");
const Item = require("../models/Item");

router.post("/update", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    const { items } = req.body;

    if (!items.length) {
      return res.status(400).json({ message: "Товары не найдены" });
    }

    const currentUser = await User.findOne({ _id });

    for (const item of items) {
      const currentItem = await Item.findOne({ _id: item.itemId });
      if (currentItem) {
        return res.status(400).json({ message: "Один из товаров не найден" });
      }

      const existingCartItem = currentUser.cart.find(
        (cartItem) => cartItem.itemId.toString() === currentItem._id.toString()
      );
      if (existingCartItem) {
        existingCartItem.count = item.count;
      } else {
        currentUser.cart.push({ itemId: currentItem._id, count: item.count });
      }
    }

    currentUser.markModified("cart"); // Обновление поля cart

    await currentUser.save();

    res.status(200).json(currentUser);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ message: "Не передан id товара" });
    }

    const currentUser = await User.findOne({ _id });
    const filteredCart = currentUser.cart.filter(
      (item) => item.itemId.toString() !== itemId.toString()
    );
    currentUser.cart = filteredCart;

    currentUser.markModified("cart");
    await currentUser.save();

    res.status(200).json({ message: "Товар успешно удален из корзины" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
