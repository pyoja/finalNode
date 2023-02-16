const express = require("express");
const router = express.Router();
const { Post, User, Like, Sequelize } = require("../models");
const { postCreateValidation, postUpdateValidation } = require("../validations");
const authMiddleware = require("../middleware/auth");

// 게시물 조회
router.get("/", async (req, res) => {
  try {
    const posts = await Post.findAll({
      // attributes: { exclude: ["userId"] },
      attributes: ["id", "title", "content", [Sequelize.fn("count", Sequelize.col("likes.id")), "numOfLikes"]],
      include: [
        { model: User, as: "user", attributes: ["nickname"] },
        {
          model: Like,
          as: "likes",
          attributes: [],
        },
      ],
      group: ["post.id"],
      order: [[Sequelize.literal("numOfLikes"), "DESC"]],
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 게시물 상세 조회
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByPk(id, {
      include: [{ model: User, as: "user", attributes: ["nickname"] }],
      attributes: { exclude: ["userId"] },
    });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 게시물 작성
router.post("/", authMiddleware, async (req, res) => {
  const { currentUser } = res.locals;
  const userId = currentUser.id;
  try {
    const { title, content } = await postCreateValidation.validateAsync(req.body);
    const post = await Post.create({
      title,
      content,
      userId,
    });
    res.json(post);
  } catch (err) {
    if (err.isJoi) {
      return res.status(422).json({ message: err.details[0].message });
    }
    res.status(500).json({ message: err.message });
  }
});

// 게시물수정
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const fieldsToBeUpdated = await postUpdateValidation.validateAsync(req.body);
    const updatedPost = await Post.update(fieldsToBeUpdated, {
      where: { id },
    });
    res.json(updatedPost);
  } catch (err) {
    if (err.isJoi) {
      return res.status(422).json({ message: err.details[0].message });
    }
    res.status(500).json({ message: err.message });
  }
});

// 게시물삭제
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.destroy({ where: { id } });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 좋아요 추가 및 취소
router.post("/:id/like", authMiddleware, async (req, res) => {
  const { id: postId } = req.params;
  const {
    currentUser: { id: userId },
  } = res.locals;
  // const userId = currentUser.id;

  try {
    const like = await Like.findOne({
      where: {
        userId,
        postId,
      },
    });

    const isLikedAlready = !!like;

    if (isLikedAlready) {
      //있다면 취소
      const deletedLike = await Like.destroy({
        where: {
          userId,
          postId,
        },
      });
      res.json(deletedLike);
    } else {
      //없으면 등록
      const postedLike = await Like.create({
        userId,
        postId,
      });
      res.json(postedLike);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
