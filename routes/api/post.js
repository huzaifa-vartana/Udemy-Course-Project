const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const userModel = require("../../models/User");
const postModel = require("../../models/Post");
const profileModel = require("../../models/Profile");
const { check, validationResult } = require("express-validator/check");
const lodash = require("lodash");

//@route post  api/posts
//desc create a post
// @access private
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.send(errors.array());
    }
    try {
      const User = await userModel.findById(req.user.id).select("-password");
      const newPost = new postModel({
        text: req.body.text,
        name: User.name,
        avatar: User.avatar,
        user: req.user.id,
      });
      const Post = await newPost.save();
      res.json(Post);
    } catch (error) {
      console.log(error.message);
      res.send("Server Error");
    }
  }
);

//@route GET api/posts
//desc get all posts
// @access private
router.get("/", [auth], async (req, res) => {
  try {
    const posts = await postModel.find().sort({ date: -1 });
    res.send(posts);
  } catch (error) {
    console.log(error.message);
    res.send("Server Error");
  }
});
//@route GET api/posts/pid
//desc get all posts by iD
// @access private
router.get("/:pid", [auth], async (req, res) => {
  try {
    const post = await postModel.findById(req.params.pid);
    if (!post) {
      return res.send("Post not found");
    }
    res.send(post);
  } catch (error) {
    console.log(error.message);
    if (error.kind === "ObjectId") {
      return res.send("Post not found");
    }
    res.send("Server Error");
  }
});
//@route DELETE api/posts/pid
//desc delete posts by iD
// @access private
router.delete("/:pid", [auth], async (req, res) => {
  try {
    const post = await postModel.findById(req.params.pid);
    // Check if post owener is same as the one deleting the post
    // if (post.user.toString() !== req.user.id) {
    //   return res.status(401).json({ user: "User not authorized" });
    // }

    if (!post) {
      return res.send("Post not found");
    }
    await post.remove();
    res.send("Post removed");
  } catch (error) {
    console.log(error.message);
    if (error.kind === "ObjectId") {
      return res.send("Post not found");
    }
    res.send("Server Error");
  }
});
//@route PUT api/posts/like/:pid
//desc Like a Post
// @access private
router.put("/like/:pid", auth, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.pid);

    // Check if the post has already been liked
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();
    return res.json(post.likes);
  } catch (error) {
    console.log(error.message);
    if (error.kind === "ObjectId") {
      return res.send("Post not found");
    }
  }
});
//@route PUT api/posts/unlike/:pid
//desc unLike a Post
// @access private
router.put("/unlike/:pid", auth, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.pid);

    // Check if the post has already been liked
    if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }
    // GET REMOVE INDEX OF LIKE
    const removeIndex = post.likes
      .map((item) => item.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    return res.send(post.likes);
  } catch (error) {
    console.log(error.message);
    if (error.kind === "ObjectId") {
      return res.send("Post not found");
    }
  }
});

// COMMENTS

//@route Comments  api/post/comment/:pid
//desc create a comment
// @access private
router.post(
  "/comment/:pid",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.send(errors.array());
    }
    try {
      const User = await userModel.findById(req.user.id).select("-password");
      const post = await postModel.findById(req.params.pid);
      const newComment = {
        text: req.body.text,
        name: User.name,
        avatar: User.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.log(error.message);
      res.send("Server Error");
    }
  }
);

//@route Comments  api/post/comment/:pid/:cid
//desc delete a comment
// @access private
router.delete("/comment/:pid/:cid", auth, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.pid);
    const user = await userModel.findById(req.user.id);
    const comment = post.comments.filter(
      (item) => item.id.toString() === req.params.cid
    );
    let userId = "";
    await comment.map((item) => {
      userId = item.user.toString();
      // return res.send(userId);
    });
    if (userId !== req.user.id) {
      return res.send("Unauthorized Deletion");
    }

    const removeIndex = post.comments
      .map((item) => item.id.toString())
      .indexOf(req.params.cid);

    post.comments.splice(removeIndex, 1);
    await post.save();

    // res.json({
    //   message: req.user.id,
    //   header: userId,
    // });
    res.json(post.comments);
  } catch (error) {
    console.log(error.message);
    res.send("Server Error");
  }
});
module.exports = router;
