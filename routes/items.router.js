const express = require("express");
const router = express.Router({ mergeParams: true });
const Item = require("../models/Item");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");

router.get("/search", async (req, res) => {
  try {
    const searchText = req.query.search;
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);

    let aggregationPipeline = [];

    if (!searchText) {
      return res.status(404).json({
        message: "Проверьте параметры запроса и повторите попытку",
      });
    }

    const regex = new RegExp(searchText, "i");
    aggregationPipeline.push({
      $match: {
        title: regex,
      },
    });

    if (!isNaN(offset)) {
      aggregationPipeline.push({ $skip: offset });
    }

    if (!isNaN(limit)) {
      aggregationPipeline.push({ $limit: limit });
    }

    const items = await Item.aggregate(aggregationPipeline);

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

router.get("/discount", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);

    const aggregationPipeline = [
      {
        $match: {
          $expr: { $gt: ["$price", "$discountPrice"] },
        },
      },
    ];

    if (!isNaN(offset)) {
      aggregationPipeline.push({ $skip: offset });
    }

    if (!isNaN(limit)) {
      aggregationPipeline.push({ $limit: limit });
    }

    const items = await Item.aggregate(aggregationPipeline);

    res.status(200).json(items);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    let query = Item.find();
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);
    console.log(limit, offset);
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.skip(offset);
    }

    const items = await query.exec();

    res.status(200).json(items);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Внутренняя ошибка сервера", error: error });
  }
});

router.get("/by_category/:category_id", async (req, res) => {
  try {
    const categoryId = req.params.category_id;
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);

    if (!categoryId) {
      return res.status(404).json({ message: "Проверьте параметры запроса" });
    }

    const currentCategory = await Category.findOne({ _id: categoryId });
    if (!currentCategory) {
      return res.status(404).json({ message: "Категория не найдена" });
    }

    const subcategoriesIdArray = currentCategory.subcategories;

    let allItems = Item.find({ subcategory_id: { $in: subcategoriesIdArray } });

    if (limit) {
      allItems = allItems.limit(limit);
    }
    if (offset) {
      allItems = allItems.skip(offset);
    }

    const items = await allItems.exec();

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/by_subcategory/:subcategory_id", async (req, res) => {
  try {
    const subcategoryId = req.params.subcategory_id;
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);

    if (!subcategoryId) {
      return res.status(404).json({ message: "Проверьте параметры запроса" });
    }

    const currentSubcategory = await Subcategory.findOne({
      _id: subcategoryId,
    });

    if (!currentSubcategory) {
      return res.status(404).json({ message: "Проверьте параметры запроса" });
    }
    const itemsIdArray = currentSubcategory.items;

    let query = Item.find({
      _id: { $in: itemsIdArray },
    });

    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.skip(offset);
    }

    const allItems = await query.exec();

    res.status(200).json(allItems);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/by_itemId/:item_id", async (req, res) => {
  try {
    const itemId = req.params.item_id;
    console.log(itemId);
    if (!itemId) {
      return res.status(404).json({ message: "Проверьте параметры запроса" });
    }

    const currentItem = await Item.findOne({ _id: itemId });
    if (!currentItem) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    res.status(200).json(currentItem);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
