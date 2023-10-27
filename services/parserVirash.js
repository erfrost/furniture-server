const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const Item = require("../models/Item");
const Subcategory = require("../models/Subcategory");

const parserVirash = async () => {
  try {
    const res = await axios.get("https://virashkaf.ru/shop/");
    const html = res.data;

    const domThree = new JSDOM(html);
    const document = domThree.window.document;

    // получение ссылок на страницы товаров
    const hrefArray = document.querySelectorAll(".product-image-link");
    const links = Array.from(hrefArray).map((element) => {
      return element.getAttribute("href");
    });

    links.map(async (link) => {
      const data = {
        furnisherId: "15В",
        specifications: [],
      };

      const res = await axios.get(link);
      const html = res.data;

      const domThree = new JSDOM(html);
      const document = domThree.window.document;

      data.title = document.querySelector(".product_title").textContent.trim();
      const price =
        document.querySelector(".price").lastElementChild.textContent;
      const formattedPrice = Number(price.replace("₽", "").replace(",", ""));
      data.price = formattedPrice * 1.7;
      data.discountPrice = formattedPrice * 1.7;
      data.cashPrice = formattedPrice * 1.87;

      data.description = document.querySelector(
        ".woocommerce-product-details__short-description"
      ).firstElementChild.textContent;

      // характеристики
      const specifications = document.querySelectorAll(
        ".woocommerce-product-attributes-item"
      );
      const formattedSpecifications = Array.from(specifications).slice(0, 3);

      Array.from(formattedSpecifications).map((spec) => {
        const value = {
          title: spec.firstElementChild.textContent.trim(),
          value: spec.lastElementChild.textContent.trim(),
        };
        data.specifications.push(value);
      });

      if (data.title === "Прихожая A-1" || data.title === "Прихожая A-2") {
        data.category_id = "653bc1db1e1415d9c89d1180";
        data.subcategory_id = "653bc2ad1e1415d9c89d1196";
      } else {
        data.category_id = "653bc1aa1e1415d9c89d1176";
        data.subcategory_id = "653bc1b31e1415d9c89d117a";
      }

      const image = document.querySelector(".wp-post-image");
      data.photo_names = [image.getAttribute("src")];

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

module.exports = parserVirash;
