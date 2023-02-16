const express = require("express");
const router = express.Router();
const { Comment, Post } = require("../models");
const { commentCreateValidation, commentUpdateValidation } = require("../validations/index");

// 댓글 전체 조회
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.findAll();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 특정 댓글 조회
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findByPk(postId);
    const postComments = await post.getComments();
    res.json(postComments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 댓글 작성
router.post("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const { content, userId } = await commentCreateValidation.validateAsync(req.body);
    const comment = await Comment.create({
      content,
      userId,
      postId,
    });
    res.json(comment);
  } catch (err) {
    if (err.isJoi) {
      return res.status(422).json({ message: err.details[0].message });
    }
    res.status(500).json({ message: err.message });
  }
});

//댓글 수정
router.patch("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const fieldsToUpdate = await commentUpdateValidation.validateAsync(req.body);
    const updatedComment = await Comment.update(fieldsToUpdate, { where: { id } });
    res.json(updatedComment);
  } catch (err) {
    if (err.isJoi) {
      return res.status(422).json({ message: err.details[0].message });
    }
    res.status(500).json({ message: err.message });
  }
});

//댓글 삭제
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedComment = await Comment.destroy({ where: { id } });
    res.json(deletedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
