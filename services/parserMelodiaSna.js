const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const Item = require("../models/Item");
const Subcategory = require("../models/Subcategory");

const baseUrl = "https://elikor.com";

const bodyDescription =
  "Вешалки для кафе являются важным элементом меблировки, который помогает создать удобную и гостеприимную атмосферу для посетителей. Они помогают сохранить порядок и предоставляют удобное место для хранения верхней одежды, освобождая посетителей от необходимости держать ее на руках или на стульях.";

const parserMelodiaSnas = async () => {
  try {
    const res = await axios.get(baseUrl + "/products/accessories/?PAGEN_1=2");
    const html = res.data;

    const domThree = new JSDOM(html);
    const document = domThree.window.document;

    // получение ссылок на страницы товаров
    const imageContainers = document.querySelectorAll(".catalog__item-inner");
    const links = Array.from(imageContainers).map((el) => {
      return el.firstElementChild.getAttribute("href");
    });

    links.map(async (link) => {
      if (!link) return;
      const data = {
        furnisherId: "19М",
        specifications: [],
        category_id: "653d4bb6f572ba32d0521823",
        subcategory_id: "653d5494f572ba32d0521b60",
        description: bodyDescription,
        specifications: [],
        photo_names: [],
      };
      const res = await axios.get(baseUrl + link);

      const html = res.data;

      const domThree = new JSDOM(html);
      const document = domThree.window.document;

      // console.log(link);

      data.title = document.querySelector(".h1").textContent;

      const formattedPrice = Number(
        document
          .querySelector(".single-product__price")
          .textContent.replace("Р", "")
      );

      data.price = formattedPrice;
      data.discountPrice = formattedPrice;
      data.cashPrice = formattedPrice;

      const images = document.querySelectorAll(".fancy");
      Array.from(images).forEach((el) => {
        if (el.firstElementChild && el.firstElementChild.tagName === "IMG") {
          data.photo_names.push(
            baseUrl + el.firstElementChild.getAttribute("src")
          );
        }
      });
      console.log(data);
      // if (data.discountPrice) {
      //   const newItem = await Item.create(data);

      //   const currentSubcategory = await Subcategory.findOne({
      //     _id: newItem.subcategory_id,
      //   });
      //   currentSubcategory.items.push(newItem._id);
      //   await currentSubcategory.save();
      // }
    });
  } catch (error) {
    console.log("error", error);
  }
};

module.exports = parserMelodiaSnas;
