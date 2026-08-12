const express = require("express");

const router = express.Router();

const {
  upload,
  uploadPostMedia,
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
} = require("../controllers/postController");

const authMiddleware =
  require("../middleware/authMiddleware");

// =====================================================
// PUBLIC READ ACCESS
// =====================================================

// Anyone can view all posts.
// NO authMiddleware here.
router.get(
  "/",
  getPosts
);

// Anyone can view a single post.
// NO authMiddleware here.
router.get(
  "/:id",
  getPost
);

// =====================================================
// AUTHENTICATED USER ACTIONS
// =====================================================

// -----------------------------------------------------
// MEDIA UPLOAD
// -----------------------------------------------------

router.post(
  "/upload-media",
  authMiddleware,
  upload.single("media"),
  uploadPostMedia
);

// -----------------------------------------------------
// CREATE POST
// -----------------------------------------------------

router.post(
  "/",
  authMiddleware,
  createPost
);

// -----------------------------------------------------
// UPDATE POST
// -----------------------------------------------------

router.put(
  "/:id",
  authMiddleware,
  updatePost
);

// -----------------------------------------------------
// DELETE POST
// -----------------------------------------------------

router.delete(
  "/:id",
  authMiddleware,
  deletePost
);

// -----------------------------------------------------
// LIKE / UNLIKE
// -----------------------------------------------------

router.post(
  "/:id/like",
  authMiddleware,
  toggleLike
);

// -----------------------------------------------------
// ADD COMMENT
// -----------------------------------------------------

router.post(
  "/:id/comments",
  authMiddleware,
  addComment
);

// -----------------------------------------------------
// DELETE COMMENT
// -----------------------------------------------------

router.delete(
  "/:id/comments/:commentId",
  authMiddleware,
  deleteComment
);

module.exports = router;