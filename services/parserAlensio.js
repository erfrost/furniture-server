const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");

const parserAlensio = async () => {
  const res = await axios.get("https://dzen.ru/a/YA724iet1032pD7v");

  const pageDocument = new JSDOM(await res.data).window.document;

  pageDocument.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      const spanElements = pageDocument.querySelectorAll("span");
      const pElements = pageDocument.querySelectorAll("p");
      console.log(spanElements.length, pElements.length);
    }, 2000);
  });
};

module.exports = parserAlensio;
