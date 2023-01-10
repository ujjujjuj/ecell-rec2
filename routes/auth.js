const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { User } = require("../db");
const argon2 = require("argon2");
const mandateSchema = require("../middleware/mandateSchema");

const JWT_TOKEN =
  process.env.NODE_ENV === "production"
    ? crypto.randomBytes(16).toString("hex")
    : "token";

const router = express.Router();

router.post(
  "/register",
  body("email").isEmail(),
  body("name").isLength({ min: 2 }),
  body("password").isLength({ min: 6 }),
  mandateSchema,
  async (req, res) => {
    let user = await User.findByPk(req.body.email);
    if (user !== null) {
      return res.status(401).json({ error: "User already exists" });
    }

    user = await User.create({
      email: req.body.email,
      name: req.body.name,
      password: await argon2.hash(req.body.password),
    });

    return res.json({
      token: jwt.sign(
        {
          email: req.body.email,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
        },
        JWT_TOKEN
      ),
    });
  }
);

router.post(
  "/login",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  mandateSchema,
  async (req, res) => {
    const user = await User.findByPk(req.body.email);
    if (
      user === null ||
      !(await argon2.verify(user.password, req.body.password))
    ) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    return res.json({
      token: jwt.sign(
        {
          email: req.body.email,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
        },
        JWT_TOKEN
      ),
    });
  }
);

module.exports = router;
exports = module.exports;
exports.JWT_TOKEN = JWT_TOKEN;
