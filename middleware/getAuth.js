const { JWT_TOKEN } = require("../routes/auth");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    req.user = jwt.verify(req.get("Authorization"), JWT_TOKEN);
    next();
  } catch (e) {
    return res.status(400).json({ error: "Invalid JWT" });
  }
};
