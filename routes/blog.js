const express = require("express");
const { query, header, body } = require("express-validator");
const { Blog } = require("../db");
const mandateSchema = require("../middleware/mandateSchema");
const getAuth = require("../middleware/getAuth");

const router = express.Router();

const BLOG_LIMIT = 3;

router.get(
  "/all",
  query("offset").default(0).isInt({ min: 0 }),
  mandateSchema,
  async (req, res) => {
    const blogs = await Blog.findAll({
      where: req.query.author ? { author: req.query.author } : {},
      limit: BLOG_LIMIT,
      offset: req.query.offset,
    });

    return res.json({ blogs });
  }
);

router.post(
  "/create",
  header("Authorization").isJWT(),
  body("title").isLength({ min: 4 }),
  body("content").default(""),
  mandateSchema,
  getAuth,
  async (req, res) => {
    const blog = await Blog.create({
      title: req.body.title,
      content: req.body.content,
      author: req.user.email,
    });

    return res.send({ id: blog.id });
  }
);
router.post(
  "/delete",
  header("Authorization").isJWT(),
  body("id").isInt(),
  mandateSchema,
  getAuth,
  async (req, res) => {
    const blog = await Blog.findByPk(req.body.id);
    if (blog === null) {
      return res.status(400).json({ error: "Invalid blog id" });
    }

    await blog.destroy();

    return res.json({ id: blog.id });
  }
);

module.exports = router;
