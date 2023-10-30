const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const Item = require("../models/Item");
const Subcategory = require("../models/Subcategory");

const baseUrl = "https://berhouse.ru";

const pages = [];

for (let i = 1; i < 5; i++) {
  pages.push(i);
}

const bodyDescription =
  "Создайте идеальное место для отдыха и развлечений в вашей гостиной с нашей коллекцией диванов. Позвольте себе наслаждаться комфортом и расслаблением каждый день, расслабляясь на уютном и стильном диване, который станет настоящим украшением вашей гостиной.";

const parserBerhouse = async () => {
  //   pages.forEach(async (pageNumber) => {
  try {
    const res = await axios.get(baseUrl + `/eshop/category/114/`);

    const html = res.data;

    const domThree = new JSDOM(html);
    const document = domThree.window.document;

    // получение ссылок на страницы товаров
    const imageContainers = document.querySelectorAll(".photo");
    const links = Array.from(imageContainers).map((el) => {
      const anchor = el.firstElementChild;
      return anchor.getAttribute("href");
    });

    links.map(async (link) => {
      if (!link) return;
      const data = {
        furnisherId: "8Б",
        specifications: [],
        category_id: "653e2930f572ba32d0522074",
        subcategory_id: "653e293cf572ba32d0522078",
        description: bodyDescription,
        specifications: [],
        photo_names: [],
      };
      const res = await axios.get(baseUrl + link);

      const html = res.data;

      const domThree = new JSDOM(html);
      const document = domThree.window.document;

      // console.log(link);
      const titleElement = document.querySelector(".creditgoods-title");
      data.title = titleElement.textContent.trim();

      const priceElement = document.getElementById("product-price");
      const formattedPrice = Number(
        priceElement.textContent.replace(" р", "").replace(/\s/g, "")
      );
      data.price = formattedPrice * 1.52;
      data.discountPrice = formattedPrice * 1.52;
      data.cashPrice = formattedPrice * 1.68;

      const imageAnchor = document.querySelector(".picture");
      const image = imageAnchor.firstElementChild;

      data.photo_names = [image.getAttribute("src")];

      //характеристики
      const rows = document.querySelectorAll(".row");
      Array.from(rows)
        .slice(0, 5)
        .map((el) => {
          const title = el.firstElementChild.textContent.trim();
          const value = el.lastElementChild.textContent.trim();
          data.specifications.push({ title, value });
        });

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
  //   });
};

module.exports = parserBerhouse;
