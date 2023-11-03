const User = require("../models/User");
const { validateAccess } = require("../services/tokenService");

module.exports = async (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  try {
    const accessToken = req.headers.authorization.split(" ")[1];

    const data = validateAccess(accessToken);
    const userId = data._id;

    const currentUser = await User.findOne({ _id: userId });
    if (!currentUser || currentUser.role !== "admin" || !data) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
