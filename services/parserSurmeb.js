const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const Item = require("../models/Item");
const Subcategory = require("../models/Subcategory");

const baseUrl = "https://surmeb.ru";

const pages = [];

for (let i = 4; i < 3; i++) {
  pages.push(i);
}

const bodyDescription =
  "Комплектующие для кухни предлагают широкий выбор опций, которые позволяют настроить и улучшить кухонную мебель в соответствии с индивидуальными предпочтениями и потребностями. Они помогают создать функциональное, стильное и удобное пространство для приготовления пищи и проведения времени на кухне.";

const parserSurmeb = async () => {
  pages.forEach(async (pageNumber) => {
    try {
      const res = await axios.get(
        baseUrl + `/catalog/tsokoli_1/?page=${pageNumber}`
      );

      const html = res.data;

      const domThree = new JSDOM(html);
      const document = domThree.window.document;

      // получение ссылок на страницы товаров
      const imageContainers = document.querySelectorAll(
        ".product-slider-images__img"
      );
      const links = Array.from(imageContainers).map((el) => {
        return el.getAttribute("href");
      });
      console.log(links);
      links.map(async (link) => {
        if (!link) return;
        const data = {
          furnisherId: "19М",
          specifications: [],
          category_id: "65300106deec648fdee813b3",
          subcategory_id: "653e1919f572ba32d0521f0b",
          description: bodyDescription,
          specifications: [],
          photo_names: [],
        };
        const res = await axios.get(baseUrl + link);

        const html = res.data;

        const domThree = new JSDOM(html);
        const document = domThree.window.document;

        // console.log(link);
        const titleElement = document.querySelector(".page-title__title");
        data.title = titleElement.textContent.trim();

        const priceElement = document.querySelector(".product-price__value");
        const formattedPrice = Number(
          priceElement.textContent.trim().replace(" ", "")
        );
        data.price = formattedPrice;
        data.discountPrice = formattedPrice;
        data.cashPrice = formattedPrice;

        const imagesContainer = document.querySelector(
          ".product-gallery__image"
        );
        Array.from(imagesContainer.querySelectorAll("a")).map((el) => {
          data.photo_names.push(baseUrl + el.getAttribute("href"));
        });

        console.log(data);
        const currentTitleItem = await Item.findOne({ title: data.title });

        // if (
        //   data.discountPrice &&
        //   data.photo_names.length &&
        //   !currentTitleItem
        // ) {
        //   const newItem = await Item.create(data);

        //   const currentSubcategory = await Subcategory.findOne({
        //     _id: newItem.subcategory_id,
        //   });
        //   currentSubcategory.items.push(newItem._id);
        //   await currentSubcategory.save();
        // }
      });
    } catch (error) {
      console.log(pageNumber);
    }
  });
};

module.exports = parserSurmeb;
