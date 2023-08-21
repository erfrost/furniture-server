const Image = require("../models/Image");
const path = require("path");
const fs = require("fs");

const deleteImage = async (photo_names) => {
  try {
    photo_names.map(async (imgName) => {
      await Image.deleteOne({ name: imgName });

      const imagePath = path.resolve("images", imgName);
      await fs.promises.unlink(imagePath);
    });
  } catch (error) {
    console.error("Произошла ошибка удаления изображения", error);
  }
};

module.exports = deleteImage;
