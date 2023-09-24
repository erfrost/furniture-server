const config = require("config");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async () => {
  // try {
  //   await User.create({
  //     email: config.adminLogin,
  //     password: await bcrypt.hash(config.adminPassword, 12),
  //     role: "admin",
  //   });
  // } catch (error) {
  //   console.error("Ошибка при добавлении администратора:", error);
  // }
};

module.exports = createAdmin;
