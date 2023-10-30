const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const Item = require("../models/Item");
const Subcategory = require("../models/Subcategory");

const baseUrl = "https://fm-olimp.ru";

const pages = [];

for (let i = 1; i < 5; i++) {
  pages.push(i);
}

const bodyDescription =
  "Создайте идеальную атмосферу в своем доме с нашей коллекцией стульев. Независимо от того, нужны ли вам стулья для обеденного стола, рабочего пространства или уютного уголка отдыха, наши стулья предлагают идеальное сочетание стиля, комфорта и функциональности.";

const parserOlymp = async () => {
  try {
    const res = await axios.get(baseUrl + `/product-category/stulya/`);

    const html = res.data;

    const domThree = new JSDOM(html);
    const document = domThree.window.document;

    // получение ссылок на страницы товаров
    const imageContainers = document.querySelectorAll(".w-grid-item-anchor");
    const links = Array.from(imageContainers).map((el) => {
      return el.getAttribute("href");
    });

    links.map(async (link, index) => {
      if (!link) return;
      const data = {
        furnisherId: "4О",
        specifications: [],
        category_id: "653bfc4c1e1415d9c89d14c6",
        subcategory_id: "653e55c2f572ba32d0522447",
        description: bodyDescription,
        specifications: [],
        photo_names: [],
      };
      await new Promise((resolve) => setTimeout(resolve, 1500 * index));

      const res = await axios.get(link);

      const html = res.data;

      const domThree = new JSDOM(html);
      const document = domThree.window.document;

      // console.log(link);
      const titleElement = document.querySelector(".post_title");
      data.title = titleElement.textContent.trim();
      //   console.log(data.title);

      const priceElement = document.querySelector("bdi");
      const formattedPrice = Number(
        priceElement.textContent
          .replace(" ", "")
          .replace(" ", "")
          .replace("₽", "")
      );
      console.log(formattedPrice);

      data.price = Math.ceil(formattedPrice * 1.52);
      data.discountPrice = Math.ceil(formattedPrice * 1.52);
      data.cashPrice = Math.ceil(formattedPrice * 1.68);

      const imageAnchors = document.querySelectorAll(".attachment-large");
      Array.from(imageAnchors)
        .slice(0, 4)
        .map((el) => {
          const src = el.getAttribute("src");
          if (src && !src.includes(" ")) {
            data.photo_names.push(src);
          }
        });

      //   //характеристики
      //   const rows = document.querySelectorAll(".row");
      //   Array.from(rows)
      //     .slice(0, 5)
      //     .map((el) => {
      //       const title = el.firstElementChild.textContent.trim();
      //       const value = el.lastElementChild.textContent.trim();
      //       data.specifications.push({ title, value });
      //     });

      console.log(data);
      const currentTitleItem = await Item.findOne({ title: data.title });

      //   if (data.discountPrice && data.photo_names.length && !currentTitleItem) {
      //     const newItem = await Item.create(data);

      //     const currentSubcategory = await Subcategory.findOne({
      //       _id: newItem.subcategory_id,
      //     });
      //     currentSubcategory.items.push(newItem._id);
      //     await currentSubcategory.save();
      //   }
    });
  } catch (error) {
    console.log(pageNumber);
  }
};

module.exports = parserOlymp;
