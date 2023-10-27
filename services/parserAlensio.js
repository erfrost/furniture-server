const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const Item = require("../models/Item");
const Subcategory = require("../models/Subcategory");

const baseUrl = "https://www.alensio.ru";

const bodyDescription =
  "Офисные диваны - это не только функциональные предметы мебели, но и элементы дизайна, которые могут создать привлекательную и профессиональную атмосферу в офисе. Правильный выбор офисного дивана поможет создать комфортное и стильное рабочее пространство для сотрудников и гостей.";

const parserAlensio = async () => {
  try {
    const res = await axios.get(baseUrl + "/catalog/ofisnyje-divany/");
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
        category_id: "653c08481e1415d9c89d1765",
        subcategory_id: "653c08511e1415d9c89d1769",
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

      data.photo_names = Array.from(images)
        .slice(0, 3)
        .map((el) => {
          return baseUrl + el.getAttribute("src");
        });

      console.log(data);

      const itemWithCurrentTitle = await Item.findOne({ title: data.title });
      if (itemWithCurrentTitle) {
        return;
      }
      const newItem = await Item.create(data);

      const currentSubcategory = await Subcategory.findOne({
        _id: newItem.subcategory_id,
      });
      currentSubcategory.items.push(newItem);
      await currentSubcategory.save();
    });
  } catch (error) {
    console.log("error", error);
  }
};

module.exports = parserAlensio;
