const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router({ mergeParams: true });

router.post("/add", authMiddleware, async (req, res) => {
  try {
    const {
      locality,
      street,
      house,
      entrance,
      floor,
      apartmentNumber,
      buyer,
      phone,
      comment = "",
    } = req.body;
    if (
      !locality ||
      !street ||
      !house ||
      !entrance ||
      !floor ||
      !apartmentNumber ||
      !buyer ||
      !phone
    ) {
      return res.status(400).json({ message: "Не все поля заполнены" });
    }

    const { _id } = req.user;

    const currentUser = await User.findOne({ _id });
    if (!currentUser) {
      return res.status(200).json({ message: "Пользователь не найден." });
    }

    const newOrder = await Order.create({
      locality,
      street,
      house,
      entrance,
      floor,
      apartmentNumber,
      buyer,
      phone,
      comment,
    });

    currentUser.orders.push(newOrder._id);
    await currentUser.save();

    res.status(200).json({ message: "Заказ успешно создан." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/delete", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(200).json({ message: "Не передан id заказа" });
    }

    await Order.deleteOne({ _id: orderId });

    const { _id } = req.user;

    const currentUser = await User.findOne({ _id });

    const filteredOrders = currentUser.orders.filter(
      (order) => order.toString() !== orderId.toString()
    );
    currentUser.orders = filteredOrders;

    currentUser.markModified("orders");
    await currentUser.save();

    res.status(200).json({ message: "Заказ успешно удален." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
