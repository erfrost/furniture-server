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

    const regex = new RegExp(
      searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );

    aggregationPipeline.push({
      $match: {
        title: regex,
      },
    });

    const allItems = await Item.aggregate(aggregationPipeline);
    const count = allItems.length;

    if (!isNaN(offset)) {
      aggregationPipeline.push({ $skip: offset });
    }

    if (!isNaN(limit)) {
      aggregationPipeline.push({ $limit: limit });
    }

    const items = await Item.aggregate(aggregationPipeline);

    res.status(200).json({ items, count });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", text: searchText });
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

    const allItems = await Item.aggregate(aggregationPipeline);
    const count = allItems.length;

    if (!isNaN(offset)) {
      aggregationPipeline.push({ $skip: offset });
    }

    if (!isNaN(limit)) {
      aggregationPipeline.push({ $limit: limit });
    }

    const items = await Item.aggregate(aggregationPipeline);

    res.status(200).json({ items, count });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    let query = Item.find();
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);

    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.skip(offset);
    }

    const items = await query.exec();

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
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

    const countItems = await Item.aggregate([
      {
        $match: {
          $or: [
            { category_id: categoryId },
            { "secondary_categories.category_id": categoryId },
          ],
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    const count = countItems.length > 0 ? countItems[0].count : 0;

    let allItems = Item.find({
      subcategory_id: { $in: subcategoriesIdArray },
    });

    if (limit) {
      allItems = allItems.limit(limit);
    }
    if (offset) {
      allItems = allItems.skip(offset);
    }

    const items = await allItems.exec();

    res.status(200).json({ items, count });
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

    const countItems = await Item.aggregate([
      {
        $match: {
          $or: [
            { subcategory_id: subcategoryId },
            { "secondary_categories.subcategory": subcategoryId },
          ],
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    const count = countItems.length > 0 ? countItems[0].count : 0;

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

    res.status(200).json({ items: allItems, count });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/by_itemId/:item_id", async (req, res) => {
  try {
    const itemId = req.params.item_id;

    if (!itemId) {
      return res.status(404).json({ message: "Проверьте параметры запроса" });
    }

    const currentItem = await Item.findOne({ _id: itemId });
    if (!currentItem) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    res.status(200).json(currentItem);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/by_ids", async (req, res) => {
  try {
    const { itemIds } = req.body;

    if (!itemIds || !itemIds.length) {
      res.status(200).json([]);
    } else {
      const items = await Item.find({ _id: { $in: itemIds } });
      res.status(200).json(items);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/by_furnisher/:furnisher_id", async (req, res) => {
  try {
    const furnisherId = req.params.furnisher_id;
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);

    let allItems = Item.find({ furnisherId });

    const countItems = await Item.find({ furnisherId });
    const count = countItems.length;

    if (limit) {
      allItems = allItems.limit(limit);
    }
    if (offset) {
      allItems = allItems.skip(offset);
    }

    const items = await allItems.exec();

    res.status(200).json({ items, count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/promotion", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);

    const query = { promotion: true };

    const count = await Item.countDocuments(query);

    let itemsQuery = Item.find(query);

    if (!isNaN(offset)) {
      itemsQuery = itemsQuery.skip(offset);
    }

    if (!isNaN(limit)) {
      itemsQuery = itemsQuery.limit(limit);
    }

    const items = await itemsQuery.exec();

    res.status(200).json({ items, count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});
router.get("/availability/all", async (req, res) => {
  try {
    const items = await Item.find({
      $or: [
        { "availability.kuzovatkina3": true },
        { "availability.neftyanikov87": true },
        { "availability.mira7": true },
      ],
    });
    console.log(items);
    const count = items.length;

    res.status(200).json({ items, count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});
router.get("/availability/kuzovatkina", async (req, res) => {
  try {
    const items = await Item.find({ "availability.kuzovatkina3": true });
    const count = items.length;

    res.status(200).json({ items, count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});
router.get("/availability/neftyanikov", async (req, res) => {
  try {
    const items = await Item.find({ "availability.neftyanikov87": true });
    const count = items.length;

    res.status(200).json({ items, count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});
router.get("/availability/mira", async (req, res) => {
  try {
    const items = await Item.find({ "availability.mira7": true });
    const count = items.length;

    res.status(200).json({ items, count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
