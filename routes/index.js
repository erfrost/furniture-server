const express = require("express");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const News = require("../models/News");
const router = express.Router({ mergeParams: true });

router.use("/auth", require("./auth.router"));

router.use("/user", require("./user.router"));

router.use("/items", require("./items.router"));

router.use("/cart", require("./cart.router"));

router.use("/admin", require("./admin.router"));

router.use("/orders", require("./order.router"));

router.use("/feedback", require("./feedback.router"));

router.get("/categoriesAndSubcategories", async (req, res) => {
  try {
    const categories = await Category.find();
    const subcategories = await Subcategory.find();
    console.log(categories, subcategories);
    res.status(200).json({ categories, subcategories });
  } catch (error) {
    console.log(error);
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
router.get("/categories/search", async (req, res) => {
  try {
    const searchText = req.query.search;
    console.log(searchText);
    let filteredCategories = [];

    if (searchText) {
      const regex = new RegExp(searchText, "i");
      filteredCategories = await Category.find({
        title: regex,
      }).exec();
    }
    console.log(filteredCategories);
    res.status(200).json(filteredCategories);
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
    console.log(error);
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

module.exports = router;
