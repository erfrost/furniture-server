// https://chelyabinsk.e-1.ru/catalog/shkafy_kupe/

const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");

const parser = async () => {
  try {
    const res = await axios.get(
      "https://chelyabinsk.e-1.ru/catalog/shkafy_kupe/    "
    );
    const html = res.data;

    const domThree = new JSDOM(html);
    const document = domThree.window.document;

    const items = document.querySelectorAll(".item");

    const dataHrefs = Array.from(items)
      .map((item) => {
        if (item instanceof HTMLDivElement) {
          return item;
        }
      })
      .filter((item) => item !== undefined);
    console.log(dataHrefs);
  } catch (error) {
    console.log("error", error);
  }
};

module.exports = parser;
