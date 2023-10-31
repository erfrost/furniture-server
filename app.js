const express = require("express");
const config = require("config");
const cors = require("cors");
const chalk = require("chalk");
const mongoose = require("mongoose");
const routes = require("./routes");
const bodyParser = require("body-parser");
const parserVirash = require("./services/parserVirash.js");
const parserAlensio = require("./services/parserAlensio");
const parserMelodiaSnas = require("./services/parserMelodiaSna");
const parserSurmeb = require("./services/parserSurmeb");
const parserBerhouse = require("./services/parserBerhouse");
const parserSultanDivan = require("./services/parserSultanDivan");
const parserOlymp = require("./services/parserOlymp");
const parserOlmeko = require("./services/parserOlmeko");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

app.use("/images", express.static("../images"));

mongoose.set("strictQuery", false);
// createAdmin();
// parserVirash();
// parserAlensio();
// parserMelodiaSnas();
// parserSurmeb();
// parserBerhouse();
// parserSultanDivan();
// parserOlymp();
parserOlmeko();

app.use("/api", routes);

const PORT = config.get("PORT") ?? 8080;

async function start() {
  try {
    await mongoose.connect(config.get("mongoUri"));
    console.log(chalk.green("mongoDB connected"));
    app.listen(PORT, () => {
      console.log(chalk.green(`Server has been started on port: ${PORT}`));
    });
  } catch (error) {
    console.log(chalk.red(error.message));
    process.exit(1);
  }
}

start();
