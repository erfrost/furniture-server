const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const Item = require("../models/Item");
const Subcategory = require("../models/Subcategory");

const baseUrl = "https://olmeko.ru";

const pages = [];

for (let i = 1; i < 3; i++) {
  pages.push(i);
}

const bodyDescription =
  "Добавьте комфорт и стиль в вашу прихожую с нашей коллекцией пуфов и банкеток. Наша мебель предлагает идеальное решение для создания уютного и функционального пространства в вашей прихожей.";

const parserOlmeko = async () => {
  const allItems = await Item.find();
  let olmeko = 0;
  let alensio = 0;
  let berhouse = 0;
  let olymp = 0;
  let sultanDivan = 0;
  let surmeb = 0;
  let virash = 0;

  allItems.map(async (item) => {
    if (item.photo_names[0]) {
      if (item.photo_names[0].includes("https://olmeko.ru")) {
        // 6О
        olmeko += 1;
        await item.updateOne({ furnisherId: "6О" });
        await item.save();
      } else if (item.photo_names[0].includes("https://www.alensio.ru")) {
        // 18А
        alensio += 1;
        await item.updateOne({ furnisherId: "18А" });
        await item.save();
      } else if (item.photo_names[0].includes("https://berhouse.ru")) {
        // 8Б
        berhouse += 1;
        await item.updateOne({ furnisherId: "8Б" });
        await item.save();
      } else if (item.photo_names[0].includes("https://fm-olimp.ru")) {
        // 4О
        olymp += 1;
        await item.updateOne({ furnisherId: "4О" });
        await item.save();
      } else if (item.photo_names[0].includes("http://sultandivan.ru")) {
        // 1C
        sultanDivan += 1;
        await item.updateOne({ furnisherId: "1C" });
        await item.save();
      } else if (item.photo_names[0].includes("https://surmeb.ru")) {
        // нету
        surmeb += 1;
      } else if (item.photo_names[0].includes("https://virashkaf.ru")) {
        // 15В
        virash += 1;
        await item.updateOne({ furnisherId: "15В" });
        await item.save();
      }
    }
  });

  console.log(olmeko, alensio, berhouse, olymp, sultanDivan, surmeb, virash);

  // // pages.forEach(async (pageNumber) => {
  // try {
  //   const res = await axios.get(
  //     baseUrl + `/mebel/prikhozhaya/pufy_i_banketki/`
  //   );

  //   const html = res.data;

  //   const domThree = new JSDOM(html);
  //   const document = domThree.window.document;

  //   // получение ссылок на страницы товаров
  //   const list = document.querySelector(".product-list");
  //   const anchors = list.querySelectorAll(".product-item__slider");

  //   const links = Array.from(anchors).map((el) => {
  //     return el.getAttribute("href");
  //   });

  //   links.map(async (link) => {
  //     if (!link) return;
  //     const data = {
  //       furnisherId: "6О",
  //       specifications: [],
  //       category_id: "653bc1db1e1415d9c89d1180",
  //       subcategory_id: "653e9772f572ba32d0523671",
  //       description: bodyDescription,
  //       specifications: [],
  //       photo_names: [],
  //     };

  //     const res = await axios.get(baseUrl + link);

  //     const html = res.data;

  //     const domThree = new JSDOM(html);
  //     const document = domThree.window.document;

  //     // console.log(link);
  //     const titleElement = document.querySelector(".card__title1");
  //     data.title = titleElement.textContent.trim();

  //     const priceElement = document.querySelector(".card__new-price");
  //     const formattedPrice = Number(
  //       priceElement.textContent.trim().replace(" ", "")
  //     );

  //     data.price = Math.ceil(formattedPrice * 1.52);
  //     data.discountPrice = Math.ceil(formattedPrice * 1.52);
  //     data.cashPrice = Math.ceil(formattedPrice * 1.68);

  //     const imageAnchors = document.querySelectorAll(".card__img-big");
  //     Array.from(imageAnchors).map((el) => {
  //       const src = el.getAttribute("href");
  //       if (src && !src.includes(" ")) {
  //         data.photo_names.push(baseUrl + src);
  //       }
  //     });

  //     //характеристики
  //     const rows = document.querySelectorAll(".card-info-item1");
  //     Array.from(rows)
  //       .slice(0, 5)
  //       .map((el) => {
  //         const title = el
  //           .querySelector(".card-info-item1__text1")
  //           .textContent.trim();
  //         const value = el
  //           .querySelector(".card-info-item1__text2")
  //           .textContent.trim();
  //         if (title.length < 50 && value) {
  //           data.specifications.push({ title, value });
  //         }
  //       });

  //     console.log(data);
  //     const currentTitleItem = await Item.findOne({ title: data.title });

  //     //   if (data.discountPrice && data.photo_names.length && !currentTitleItem) {
  //     //     const newItem = await Item.create(data);

  //     //     const currentSubcategory = await Subcategory.findOne({
  //     //       _id: newItem.subcategory_id,
  //     //     });
  //     //     currentSubcategory.items.push(newItem._id);
  //     //     await currentSubcategory.save();
  //     //   }
  //   });
  // } catch (error) {
  //   console.log(error);
  // }
  // // });
};

module.exports = parserOlmeko;
