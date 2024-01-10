const fs = require("fs");
const sitemapPath = "./sitemap.xml";
const Item = require("./models/Item");
const Furnisher = require("./models/Furnisher");
const Category = require("./models/Category");
const Subcategory = require("./models/Subcategory");

async function createSitemap() {
  const ids = await Subcategory.find({}, "_id");
  const sitemapData = [];

  //   ids.forEach((item) => {
  //     console.log(item._id);
  //     const loc = `https://dom888.ru/subcategory/${item._id.toString()}`;
  //     const lastmod = new Date().toISOString();
  //     const priority = 0.8;

  //     const urlElement = `<url>\n<loc>${loc}</loc>\n<lastmod>${lastmod}</lastmod>\n<priority>${priority}</priority>\n</url>\n`;

  //     sitemapData.push(urlElement);
  //   });

  const loc = `https://dom888.ru/furnitures`;
  const lastmod = new Date().toISOString();
  const priority = 0.8;

  const urlElement = `<url>\n<loc>${loc}</loc>\n<lastmod>${lastmod}</lastmod>\n<priority>${priority}</priority>\n</url>\n`;

  sitemapData.push(urlElement);

  const sitemapContent = sitemapData.join("");

  fs.appendFile(sitemapPath, sitemapContent, (err) => {
    if (err) throw err;
    console.log("Sitemap has been updated");
  });
}

module.exports = createSitemap;
