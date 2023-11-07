const express = require("express");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const News = require("../models/News");
const Kitchen = require("../models/Kitchen");
const KitchenWork = require("../models/KitchenWork");
const Item = require("../models/Item");
const router = express.Router({ mergeParams: true });

router.use("/auth", require("./auth.router"));

router.use("/user", require("./user.router"));

router.use("/items", require("./items.router"));

router.use("/cart", require("./cart.router"));

router.use("/admin", require("./admin.router"));

router.use("/orders", require("./order.router"));

router.use("/feedback", require("./feedback.router"));

router.use("/telegram", require("./telegram.router"));

router.get("/categoriesAndSubcategories", async (req, res) => {
  try {
    const categories = await Category.find();
    const subcategories = await Subcategory.find();

    res.status(200).json({ categories, subcategories });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/subcategories/search", async (req, res) => {
  try {
    const searchText = req.query.search;

    let filteredSubcategories = [];

    if (searchText) {
      const regex = new RegExp(searchText, "i");
      filteredSubcategories = await Subcategory.find({
        title: regex,
      }).exec();
    }

    res.status(200).json(filteredSubcategories);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/subcategories/:category_id", async (req, res) => {
  try {
    const categoryId = req.params.category_id;

    const category = await Category.findOne({ _id: categoryId });
    if (!category) {
      return res.status(404).json({ message: "Категория не найдена" });
    }

    const subcategoriesIdArray = category.subcategories;

    const subcategories = await Subcategory.find({
      _id: { $in: subcategoriesIdArray },
    });

    res.status(200).json(subcategories);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/news", async (req, res) => {
  try {
    const allNews = await News.find();

    res.status(200).json(allNews);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/kitchen", async (req, res) => {
  try {
    const allKitchens = await Kitchen.find();

    res.status(200).json(allKitchens);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/kitchen/by_id/:kitchen_id", async (req, res) => {
  try {
    const kitchenId = req.params.kitchen_id;
    if (!kitchenId) {
      return res.status(404).json({ message: "Проверьте параметры запроса" });
    }

    const currentKitchen = await Kitchen.findOne({ _id: kitchenId });

    res.status(200).json(currentKitchen);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/kitchen/search", async (req, res) => {
  try {
    const searchText = req.query.search;

    let filteredKitchens = [];

    if (searchText) {
      const regex = new RegExp(searchText, "i");
      filteredKitchens = await Kitchen.find({
        title: regex,
      }).exec();
    }

    res.status(200).json(filteredKitchens);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/kitchenWork", async (req, res) => {
  try {
    const allKitchenWork = await KitchenWork.find();

    res.status(200).json(allKitchenWork);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/furnisher/:furnisher_id", async (req, res) => {
  try {
    const furnisherId = req.params.furnisher_id;
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);

    let allItems = Item.find({ furnisherId });

    if (limit) {
      allItems = allItems.limit(limit);
    }
    if (offset) {
      allItems = allItems.skip(offset);
    }

    const items = await allItems.exec();
    const count = items.length;

    res.status(200).json({ items, count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
