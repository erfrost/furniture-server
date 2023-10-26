// https://chelyabinsk.e-1.ru/catalog/shkafy_kupe/

const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");

const defaultPath = "https://mebelmif.ru";

const downloadImage = async (imageUrl, filename) => {
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "binary");
  fs.writeFileSync(filename, buffer);
};

const parser = async () => {
  try {
    const res = await axios.get(
      defaultPath + "/katalog/kuhni/kuhni-mdf-modulnye-sis/"
    );
    const html = res.data;

    const domThree = new JSDOM(html);
    const document = domThree.window.document;

    // получение ссылок на страницы товаров
    const hrefArray = document.querySelectorAll(".product-item-thumb");
    const links = Array.from(hrefArray).map((element) => {
      return element.getAttribute("href");
    });

    links.map(async (link) => {
      const data = {
        link,
        title: null,
        description:
          "Модульная кухня предлагает вам возможность создать индивидуальное и функциональное решение для вашей кухни, которое сочетает в себе стиль, удобство и эффективность. Благодаря своей гибкости и адаптивности, модульные кухни являются популярным выбором для многих домов и квартир.",
        colors1: null,
        colors2: null,
        colors3: null,
        price: 145000,
        category_id: "65300106deec648fdee813b3",
        subcategory_id: "6530011fdeec648fdee813b7",
        specifications: [],
      };

      const res = await axios.get(defaultPath + link);
      const html = res.data;

      const domThree = new JSDOM(html);
      const document = domThree.window.document;

      // название товара
      data.title = document.querySelector("h2").textContent;

      // цвета
      const colorsContainer = document.querySelectorAll(".widget_colors");

      const colors1 = colorsContainer[0].querySelectorAll("span");
      const colors2 = colorsContainer[1].querySelectorAll("span");
      const colors3 = colorsContainer[2].querySelectorAll("span");

      data.colors1 = Array.from(colors1).map((color) => {
        return color.getAttribute("title");
      });
      data.colors2 = Array.from(colors2).map((color) => {
        return color.getAttribute("title");
      });
      data.colors3 = Array.from(colors3).map((color) => {
        return color.getAttribute("title");
      });

      // изображения
      const imagesContainer = document.querySelectorAll(".slick-slide");
      const filteredImages = Array.from(imagesContainer).filter((slide) => {
        return slide.hasAttribute("aria-describedby");
      });
      // console.log(filteredImages.length);
      // const images = imagesContainer.querySelector("img");

      // const imageUrls = Array.from(images).map((image) => {
      //   return image.getAttribute("src");
      // });

      // imageUrls.map(async (src) => {
      //   const res = await axios.get(src, { responseType: "blob" });
      //   const imageBlob = res.data;

      //   const formData = new FormData();
      //   formData.append("image", imageBlob);

      //   const uploadRes = await fetch(
      //     "https://api.dom888.ru/api/admin/uploadImage",
      //     formData,
      //     {
      //       method: "POST",
      //       headers: {
      //         Authorization: `Bearer ${getAccessToken()}`,
      //         "Content-Type": "multipart/form-data",
      //       },
      //     }
      //   );
      // });
    });
  } catch (error) {
    console.log("error", error);
  }
};

module.exports = parser;
