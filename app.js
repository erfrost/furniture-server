const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const config = require("config");
const cors = require("cors");
const chalk = require("chalk");
const mongoose = require("mongoose");
const routes = require("./routes");
const bodyParser = require("body-parser");
const parser = require("./services/parser");
const BotUser = require("./models/BotUser");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

app.use("/images", express.static("../images"));
app.use("/files", express.static("../files"));

mongoose.set("strictQuery", false);
// createAdmin();
parser();

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
