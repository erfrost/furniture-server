const express = require("express");
const router = express.Router({ mergeParams: true });
const multer = require("multer");
const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid");
const Item = require("../models/Item");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const News = require("../models/News");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const Image = require("../models/Image");
const deleteImage = require("../services/deleteImage");
const Kitchen = require("../models/Kitchen");
const KitchenWork = require("../models/KitchenWork");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../../images");
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}-${slugify(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

//создание товара
router.post("/items", async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category_id,
      subcategory_id,
      specifications,
      photo_names,
    } = req.body;

    if (
      !title ||
      !description ||
      !price ||
      !category_id ||
      !subcategory_id ||
      !specifications ||
      !photo_names.length
    ) {
      return res.status(404).json({ message: "Поля не должны быть пустыми" });
    }
    if (title.length > 100 || description.length > 1024) {
      return res.status(404).json({ message: "Превышен лимит по символам" });
    }
    const subcategory = await Subcategory.findOne({ _id: subcategory_id });
    if (!subcategory) {
      return res.status(404).json({ message: "Подкатегория не найдена" });
    }
    if (subcategory_id.toString() !== subcategory._id.toString()) {
      return res.status(404).json({ message: "Категория не найдена" });
    }
    if (await Item.findOne({ title: req.body.title })) {
      return res
        .status(404)
        .json({ message: "Товар с таким название уже существует" });
    }

    const newItem = await Item.create({
      title,
      description,
      price,
      discountPrice: price,
      category_id,
      subcategory_id,
      specifications,
      photo_names,
    });

    subcategory.items.push(newItem);

    await subcategory.save();

    res.status(200).json({ message: "Товар успешно добавлен" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

//обновление товара
router.patch("/items/:item_id", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(404).json({ message: "Поля не должны быть пустыми" });
    }

    const { title, description, photo_names } = req.body;

    if (
      (title && title.length > 100) ||
      (description && description.length > 1024)
    ) {
      return res.status(404).json({ message: "Превышен лимит по символам" });
    }

    const currentItem = await Item.findOne({ _id: req.params.item_id });
    if (!currentItem) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    const prevImages = currentItem.photo_names;
    const checkImages = prevImages.filter(
      (item) => !photo_names.includes(item)
    );
    console.log(checkImages);

    await Image.deleteMany({
      name: { $in: checkImages },
    });

    await currentItem.updateOne(req.body);

    res.status(200).json({ message: "Товар успешно обновлен" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//удаление товара
router.delete("/items/:item_id", async (req, res) => {
  try {
    const itemId = req.params.item_id;

    const currentItem = await Item.findOne({ _id: itemId });
    if (!currentItem) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    const subcategory = await Subcategory.findOne({
      _id: currentItem.subcategory_id,
    });
    if (!subcategory) {
      return res.status(404).json({ message: "Подкатегория не найдена" });
    }
    subcategory.items.pull(itemId);

    await subcategory.save();

    await currentItem.deleteOne();

    await Image.deleteMany({
      name: { $in: currentItem.photo_names },
    });

    res.status(200).json({ message: "Товар успешно удален" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//создание категории
router.post("/categories", async (req, res) => {
  try {
    const { title, photo_name } = req.body;

    if (!title) {
      return res.status(404).json({ message: "Поля не должны быть пустыми" });
    }
    if (title.length > 100) {
      return res.status(404).json({ message: "Превышен лимит по символам" });
    }
    if (await Category.findOne({ title })) {
      return res
        .status(404)
        .json({ message: "Категория с таким названием уже существует" });
    }

    await Category.create({
      title,
      photo_name,
    });

    res.status(200).json({ message: "Категория успешно добавлена" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//обновление категории
router.patch("/categories/:category_id", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(404).json({ message: "Поля не должны быть пустыми" });
    }
    const { title, photo_name } = req.body;

    if (title.length > 100) {
      return res.status(404).json({ message: "Превышен лимит по символам" });
    }
    if (await Category.findOne({ title })) {
      return res
        .status(404)
        .json({ message: "Категория с таким названием уже существует" });
    }

    const currentCategory = await Category.findOne({
      _id: req.params.category_id,
    });
    if (!currentCategory) {
      return res.status(404).json({ message: "Категория не найдена" });
    }

    await Image.deleteOne({ name: currentCategory.photo_name });

    await currentCategory.updateOne({
      title,
      photo_name: photo_name,
    });

    res.status(200).json({ message: "Категория успешно обновлена" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//удаление категории
router.delete("/categories/:category_id", async (req, res) => {
  try {
    const currentCategory = await Category.findOne({
      _id: req.params.category_id,
    });
    if (!currentCategory) {
      return res.status(404).json({ message: "Категория не найдена" });
    }
    const subcategoriesIdArray = currentCategory.subcategories;

    subcategoriesIdArray.map(
      async (_id) => await Item.deleteOne({ subcategory_id: _id })
    );
    subcategoriesIdArray.map(async (_id) => await Subcategory.deleteOne(_id));

    currentCategory.deleteOne(req.body);

    await Image.deleteOne({ name: currentCategory.photo_name });
    await deleteImage([currentCategory.photo_name]);

    res.status(200).json({ message: "Категория успешно удалена" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//создание подкатегории
router.post("/subcategories", async (req, res) => {
  try {
    const { title, category_id } = req.body;
    console.log(title, category_id);
    if (!title || !category_id) {
      return res.status(404).json({ message: "Поля не должны быть пустыми" });
    }
    if (title.length > 100) {
      return res.status(404).json({ message: "Превышен лимит по символам" });
    }

    const category = await Category.findOne({ _id: category_id });
    if (!category) {
      return res.status(404).json({ message: "Категория не найдена" });
    }
    if (category.subcategories.length) {
      for (const id of category.subcategories) {
        const currentSubcategory = await Subcategory.findOne({ _id: id });
        if (currentSubcategory?.title === title) {
          return res.status(404).json({
            message: "Подкатегория с таким названием уже существует",
          });
        }
      }
    }

    const newSubcategory = await Subcategory.create({
      title,
      category_id,
    });
    category.subcategories.push(newSubcategory._id);

    await category.save();

    res.status(200).json({ message: "Подкатегория успешно добавлена" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//обновление подкатегории
router.patch("/subcategories/:subcategory_id", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(404).json({ message: "Поля не должны быть пустыми" });
    }
    if (title.length > 100) {
      return res.status(404).json({ message: "Превышен лимит по символам" });
    }
    if (await Subcategory.findOne({ title })) {
      return res
        .status(404)
        .json({ message: "Подкатегория с таким названием уже существует" });
    }
    if (await Subcategory.findOne({ title })) {
      return res
        .status(404)
        .json({ message: "Подкатегория с таким названием уже существует" });
    }

    const currentSubcategory = await Subcategory.findOne({
      _id: req.params.subcategory_id,
    });
    if (!currentSubcategory) {
      return res
        .status(404)
        .json({ message: "Подкатегория не найдена не найден" });
    }

    await currentSubcategory.updateOne({
      title,
    });

    res.status(200).json({ message: "Категория успешно обновлена" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//удаление подкатегории
router.delete("/subcategories/:subcategory_id", async (req, res) => {
  try {
    const subcategoryId = req.params.subcategory_id;

    const currentSubcategory = await Subcategory.findOne({
      _id: subcategoryId,
    });
    if (!currentSubcategory) {
      return res.status(404).json({ message: "Подкатегория не найдена" });
    }

    const itemsIdArray = currentSubcategory.items;
    itemsIdArray.map(async (_id) => {
      await Item.deleteOne(_id);
    });

    const category = await Category.findOne({
      _id: currentSubcategory.category_id,
    });
    if (!category) {
      return res.status(404).json({ message: "Категория не найдена" });
    }

    category.subcategories.pull({ _id: subcategoryId });

    await category.save();

    await currentSubcategory.deleteOne();

    res.status(200).json({ message: "Подкатегория успешно удалена" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/news", upload.any(), async (req, res) => {
  try {
    const file = req.files;
    const {
      title,
      description,
      categoryId: category_id,
      subcategoryId: subcategory_id,
    } = req.body;

    if (!file.length) {
      return res.status(404).json({ message: "Изображение не загружено" });
    }
    if (!title || !description || (!category_id && !subcategory_id)) {
      return res.status(404).json({ message: "Поля не должны быть пустыми" });
    }
    if (title.length > 100 || description.length > 130) {
      return res.status(404).json({ message: "Превышен лимит по символам" });
    }

    await Image.create({
      name: file[0].filename,
    });

    if (category_id) {
      await News.create({
        title,
        description,
        photo_name: file[0].filename,
        category_id,
      });
    } else if (subcategory_id) {
      await News.create({
        title,
        description,
        photo_name: file[0].filename,
        subcategory_id,
      });
    }

    res.status(200).json({ message: "Новость успешно добавлена" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/news/:news_id", async (req, res) => {
  try {
    const { news_id } = req.params;
    if (!news_id) {
      return res
        .status(404)
        .json({ message: "Не выбрана новость для удаления" });
    }

    const currentPost = await News.findOne({ _id: news_id });
    if (!currentPost) {
      return res.status(404).json({ message: "Новость не найдена" });
    }

    await Image.deleteOne({ name: currentPost.photo_name });
    await deleteImage([currentPost.photo_name]);

    await News.deleteOne({ _id: news_id });

    res.status(200).json({ message: "Новость успешно удалена" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/kitchen", upload.any(), async (req, res) => {
  try {
    const files = req.files;
    const { title, description, specifications, advantages } = req.body;

    if (!files.length) {
      return res.status(404).json({ message: "Изображение не загружено" });
    }
    if (!title || !description || !specifications || !advantages) {
      return res.status(404).json({ message: "Поля не должны быть пустыми" });
    }
    if (title.length > 100 || description.length > 1024) {
      return res.status(404).json({ message: "Превышен лимит по символам" });
    }

    const newKitchen = await Kitchen.create({
      title,
      description,
      specifications: JSON.parse(specifications),
      advantages,
    });

    const newImages = [];
    for (const img of files) {
      const currentImage = await Image.create({
        name: img.filename,
      });

      newImages.push(currentImage.name);
    }

    newKitchen.photo_names = newImages;

    await newKitchen.save();

    res.status(200).json({ message: "Кухня успешно добавлена" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/kitchen", async (req, res) => {
  try {
    const { kitchenId } = req.body;
    console.log(kitchenId);
    if (!kitchenId) {
      return res.status(404).json({ message: "Поля не должны быть пустыми" });
    }

    const currentKitchen = await Kitchen.findOne({ _id: kitchenId });

    if (!currentKitchen) {
      return res.status(404).json({ message: "Кухня не найдена" });
    }

    currentImages = currentKitchen.photo_names;

    currentImages.forEach(async (img) => {
      await Image.deleteOne({ name: img });
    });
    await deleteImage(currentImages);

    await Kitchen.deleteOne({ _id: kitchenId });

    res.status(200).json({ message: "Кухня успешно удалена" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/kitchen/works", upload.any(), async (req, res) => {
  try {
    const files = req.files;
    const { prevImages } = req.body;

    const imagesToDelete = await KitchenWork.find({
      photo_name: { $nin: JSON.parse(prevImages) },
    });

    await KitchenWork.deleteMany({
      photo_name: { $nin: JSON.parse(prevImages) },
    });

    await deleteImage(imagesToDelete.map((item) => item.photo_name));

    files.map(async (img) => {
      await KitchenWork.create({
        photo_name: img.filename,
      });

      await Image.create({ name: img.filename });
    });

    res.status(200).json({ message: "Фотографии успешно обновлены" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/uploadImage", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    console.log(file);
    if (!file) {
      return res.status(400).json({ message: "Файл не был загружен" });
    }

    await Image.create({
      name: file.filename,
    });

    res.status(200).json(file.filename);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/discount", async (req, res) => {
  try {
    const { itemId, discountPrice } = req.body;
    console.log(discountPrice);
    if (!itemId || !discountPrice) {
      return res.status(404).json({ message: "Поля не должны быть пустыми" });
    }

    const currentItem = await Item.findOne({ _id: itemId });
    if (!currentItem) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    currentItem.discountPrice = discountPrice;

    await currentItem.save();

    res.status(200).json({ message: "Скидка успешно добавлена" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
