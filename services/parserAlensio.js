const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const Item = require("../models/Item");
const Subcategory = require("../models/Subcategory");

const baseUrl = "https://www.alensio.ru";

const bodyDescription =
  "Вешалки для кафе являются важным элементом меблировки, который помогает создать удобную и гостеприимную атмосферу для посетителей. Они помогают сохранить порядок и предоставляют удобное место для хранения верхней одежды, освобождая посетителей от необходимости держать ее на руках или на стульях.";

const parserAlensio = async () => {
  try {
    const res = await axios.get(baseUrl + "/catalog/komplektuyushchie/");
    const html = res.data;

    const domThree = new JSDOM(html);
    const document = domThree.window.document;

    // получение ссылок на страницы товаров
    const imageContainers = document.querySelectorAll(".image");
    const hrefArray = Array.from(imageContainers).map((el) => {
      return el.lastElementChild;
    });

    const links = Array.from(hrefArray).map((el) => {
      return el.getAttribute("href");
    });

    links.map(async (link) => {
      if (!link) return;
      const data = {
        furnisherId: "18А",
        specifications: [],
        category_id: "653d376ff572ba32d05201bd",
        subcategory_id: "653d3798f572ba32d05201c1",
        description: bodyDescription,
        specifications: [],
      };
      const res = await axios.get(baseUrl + link);

      const html = res.data;

      const domThree = new JSDOM(html);
      const document = domThree.window.document;

      data.title = document.querySelector("h1").textContent;
      const formattedPrice = Number(
        document.getElementById("ch_wp").textContent.replace(" руб.", "")
      );

      data.price = formattedPrice * 1.8;
      data.discountPrice = formattedPrice * 1.8;
      data.cashPrice = formattedPrice * 2;

      const images = document.querySelectorAll(".res-img");
      const filteredImages = Array.from(images).filter(
        (el) => el.getAttribute("src").indexOf("resize_cache") !== -1
      );

      data.photo_names = filteredImages.map((el) => {
        return baseUrl + el.getAttribute("src");
      });

      console.log(data);

      const itemWithCurrentTitle = await Item.findOne({ title: data.title });
      if (itemWithCurrentTitle) {
        return;
      }

      // const newItem = await Item.create(data);

      // const currentSubcategory = await Subcategory.findOne({
      //   _id: newItem.subcategory_id,
      // });
      // currentSubcategory.items.push(newItem._id);
      // await currentSubcategory.save();
    });
  } catch (error) {
    console.log("error", error);
  }
};

module.exports = parserAlensio;
