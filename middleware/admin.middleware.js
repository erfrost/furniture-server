const User = require("../models/User");

module.exports = async (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  try {
    const { _id } = req.user;

    const currentUser = await User.findOne({ _id });

    if (!_id || !currentUser || currentUser.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
