const jwt = require("jsonwebtoken");
const config = require("config");
const Token = require("../models/Token");

class TokenService {
  generate(payload, autoAuth) {
    const accessToken = jwt.sign(payload, config.get("accessSecret"), {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(payload, config.get("refreshSecret"));
    if (autoAuth === true) {
      const autoAuthToken = jwt.sign(payload, config.get("autoAuthSecret"));
      return {
        accessToken,
        refreshToken,
        autoAuthToken,
        expiresIn: 3600,
      };
    } else {
      return {
        accessToken,
        refreshToken,
        expiresIn: 3600,
      };
    }
  }

  async save(userId, refreshToken, autoAuthToken) {
    const data = await Token.findOne({ user: userId });

    if (data) {
      data.refreshToken = refreshToken;
      data.autoAuthToken = autoAuthToken;
      return data.save();
    } else {
      const token = await Token.create({
        user: userId,
        refreshToken,
        autoAuthToken,
      });
      return token;
    }
  }

  validateRefresh(refreshToken) {
    try {
      const verify = jwt.verify(refreshToken, config.get("refreshSecret"));
      return verify;
    } catch (error) {
      return null;
    }
  }

  validateAccess(accessToken) {
    try {
      return jwt.verify(accessToken, config.get("accessSecret"));
    } catch (error) {
      return null;
    }
  }

  validateAutoAuth(autoAuthToken) {
    try {
      const verify = jwt.verify(autoAuthToken, config.get("autoAuthSecret"));
      return verify;
    } catch (error) {
      return null;
    }
  }

  async findToken(refreshToken) {
    try {
      return await Token.findOne({ refreshToken });
    } catch (error) {
      return null;
    }
  }
}

module.exports = new TokenService();
