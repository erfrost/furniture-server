const express = require("express");
const config = require("config");
const cors = require("cors");
const chalk = require("chalk");
const path = require("path");
const mongoose = require("mongoose");
const routes = require("./routes");
const bodyParser = require("body-parser");
const createAdmin = require("./services/createAdmin");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: "7mb" }));
app.use(bodyParser.urlencoded({ limit: "7mb", extended: true }));

app.use("/images", express.static(path.join(__dirname, "images")));

mongoose.set("strictQuery", false);

// createAdmin();

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
