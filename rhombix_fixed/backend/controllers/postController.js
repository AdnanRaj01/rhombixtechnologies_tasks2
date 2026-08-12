const mongoose = require("mongoose");
const multer = require("multer");

const Post = require("../models/Post");
const cloudinary =
  require("../config/cloudinary");

// =====================================================
// CONSTANTS
// =====================================================

const MAX_CONTENT_LENGTH = 1000;

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const MAX_VIDEO_SIZE =
  100 * 1024 * 1024;

// =====================================================
// USER ID
// =====================================================

const getUserId = (req) => {
  return (
    req.user?.userId ||
    req.user?.id
  );
};

// =====================================================
// OBJECT ID VALIDATION
// =====================================================

const isValidObjectId = (
  id,
) => {
  return mongoose.Types.ObjectId.isValid(
    id,
  );
};

// =====================================================
// MEDIA VALIDATION
// =====================================================

const validateMedia = (
  media,
) => {
  if (!media) {
    return null;
  }

  if (
    typeof media !==
    "object"
  ) {
    throw new Error(
      "Invalid media information.",
    );
  }

  if (
    !media.url ||
    !media.publicId
  ) {
    throw new Error(
      "Invalid media information.",
    );
  }

  if (
    ![
      "image",
      "video",
    ].includes(
      media.resourceType,
    )
  ) {
    throw new Error(
      "Invalid media resource type.",
    );
  }

  return {
    url: String(
      media.url,
    ),

    publicId: String(
      media.publicId,
    ),

    resourceType:
      media.resourceType,

    width:
      Number.isFinite(
        media.width,
      )
        ? media.width
        : null,

    height:
      Number.isFinite(
        media.height,
      )
        ? media.height
        : null,

    duration:
      Number.isFinite(
        media.duration,
      )
        ? media.duration
        : null,
  };
};

// =====================================================
// POPULATE POST
// =====================================================

const populatePost =
  async (postId) => {
    return Post.findById(
      postId,
    )
      .populate(
        "author",
        "name username profilePicture",
      )
      .populate(
        "comments.user",
        "name username profilePicture",
      );
  };

// =====================================================
// MULTER
// =====================================================

const storage =
  multer.memoryStorage();

const upload =
  multer({
    storage,

    // Maximum allowed by Multer.
    // Individual image/video limits
    // are checked below.
    limits: {
      fileSize:
        MAX_VIDEO_SIZE,
    },

    fileFilter: (
      req,
      file,
      cb,
    ) => {
      const allowedImages = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      const allowedVideos = [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-msvideo",
      ];

      if (
        allowedImages.includes(
          file.mimetype,
        ) ||
        allowedVideos.includes(
          file.mimetype,
        )
      ) {
        return cb(
          null,
          true,
        );
      }

      return cb(
        new Error(
          "Only JPG, PNG, WEBP, GIF images and MP4, WEBM, MOV, AVI videos are allowed.",
        ),
      );
    },
  });

// =====================================================
// CLOUDINARY UPLOAD
// =====================================================

const uploadToCloudinary =
  (
    buffer,
    resourceType,
  ) => {
    return new Promise(
      (
        resolve,
        reject,
      ) => {
        const options = {
          folder:
            "rhombix-social/posts",

          resource_type:
            resourceType,
        };

        if (
          resourceType ===
          "image"
        ) {
          options.transformation =
            [
              {
                quality:
                  "auto",
                fetch_format:
                  "auto",
              },
            ];
        }

        const stream =
          cloudinary.uploader.upload_stream(
            options,
            (
              error,
              result,
            ) => {
              if (error) {
                reject(
                  error,
                );
              } else {
                resolve(
                  result,
                );
              }
            },
          );

        stream.end(
          buffer,
        );
      },
    );
  };

// =====================================================
// DELETE CLOUDINARY MEDIA
// =====================================================

const deleteCloudinaryMedia =
  async (media) => {
    if (
      !media?.publicId
    ) {
      return;
    }

    try {
      await cloudinary.uploader.destroy(
        media.publicId,
        {
          resource_type:
            media.resourceType ||
            "image",
        },
      );
    } catch (error) {
      console.error(
        "Cloudinary delete error:",
        error.message,
      );
    }
  };

// =====================================================
// UPLOAD POST MEDIA
// =====================================================

const uploadPostMedia =
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Please select an image or video.",
          });
      }

      const isVideo =
        req.file.mimetype.startsWith(
          "video/",
        );

      const resourceType =
        isVideo
          ? "video"
          : "image";

      const maxSize =
        isVideo
          ? MAX_VIDEO_SIZE
          : MAX_IMAGE_SIZE;

      if (
        req.file.size >
        maxSize
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              isVideo
                ? "Video must be 100MB or less."
                : "Image must be 10MB or less.",
          });
      }

      const result =
        await uploadToCloudinary(
          req.file.buffer,
          resourceType,
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Media uploaded successfully.",

          media: {
            url:
              result.secure_url,

            publicId:
              result.public_id,

            resourceType,

            width:
              result.width ||
              null,

            height:
              result.height ||
              null,

            duration:
              result.duration ||
              null,
          },
        });
    } catch (error) {
      console.error(
        "Media Upload Error:",
        error,
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            error.message ||
            "Failed to upload media.",
        });
    }
  };

// =====================================================
// CREATE POST
// =====================================================

const createPost =
  async (req, res) => {
    try {
      const {
        content,
        media,
      } = req.body;

      const cleanContent =
        content?.trim() ||
        "";

      if (
        cleanContent.length >
        MAX_CONTENT_LENGTH
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              `Post cannot exceed ${MAX_CONTENT_LENGTH} characters.`,
          });
      }

      let cleanMedia = null;

      try {
        cleanMedia =
          validateMedia(
            media,
          );
      } catch (mediaError) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              mediaError.message,
          });
      }

      // At least text OR media required
      if (
        !cleanContent &&
        !cleanMedia
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Add some text, a photo, or a video to create a post.",
          });
      }

      const userId =
        getUserId(req);

      if (!userId) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Authenticated user not found.",
          });
      }

      const post =
        await Post.create({
          author: userId,

          content:
            cleanContent,

          media:
            cleanMedia,

          image:
            cleanMedia?.resourceType ===
            "image"
              ? cleanMedia.url
              : "",
        });

      const populatedPost =
        await populatePost(
          post._id,
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Post created successfully.",

          post:
            populatedPost,
        });
    } catch (error) {
      console.error(
        "Create Post Error:",
        error,
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to create post.",
        });
    }
  };

// =====================================================
// GET SINGLE POST
// =====================================================

const getPost =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid post ID.",
          });
      }

      const post =
        await Post.findById(
          id,
        )
          .populate(
            "author",
            "name username profilePicture",
          )
          .populate(
            "comments.user",
            "name username profilePicture",
          );

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Post not found.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,
          post,
        });
    } catch (error) {
      console.error(
        "Get Single Post Error:",
        error,
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to fetch post.",
        });
    }
  };

// =====================================================
// GET ALL POSTS
// =====================================================

const getPosts =
  async (req, res) => {
    try {
      const posts =
        await Post.find()
          .populate(
            "author",
            "name username profilePicture",
          )
          .populate(
            "comments.user",
            "name username profilePicture",
          )
          .sort({
            createdAt: -1,
          });

      return res
        .status(200)
        .json({
          success: true,
          count:
            posts.length,
          posts,
        });
    } catch (error) {
      console.error(
        "Get Posts Error:",
        error,
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to fetch posts.",
        });
    }
  };

// =====================================================
// UPDATE POST
// =====================================================

const updatePost =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid post ID.",
          });
      }

      const {
        content,
        media,
        removeMedia,
      } = req.body;

      const cleanContent =
        content?.trim() ||
        "";

      if (
        cleanContent.length >
        MAX_CONTENT_LENGTH
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              `Post cannot exceed ${MAX_CONTENT_LENGTH} characters.`,
          });
      }

      let cleanMedia = null;

      if (media) {
        try {
          cleanMedia =
            validateMedia(
              media,
            );
        } catch (mediaError) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                mediaError.message,
            });
        }
      }

      if (
        !cleanContent &&
        !cleanMedia &&
        !removeMedia
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Post cannot be empty.",
          });
      }

      const post =
        await Post.findById(
          id,
        );

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Post not found.",
          });
      }

      const userId =
        getUserId(req);

      if (
        post.author.toString() !==
        userId.toString()
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "You can only edit your own post.",
          });
      }

      post.content =
        cleanContent;

      // -----------------------------------------------
      // REMOVE MEDIA
      // -----------------------------------------------

      if (
        removeMedia &&
        !cleanMedia
      ) {
        await deleteCloudinaryMedia(
          post.media,
        );

        post.media = null;
        post.image = "";
      }

      // -----------------------------------------------
      // REPLACE MEDIA
      // -----------------------------------------------

      if (cleanMedia) {
        const oldMedia =
          post.media;

        post.media =
          cleanMedia;

        post.image =
          cleanMedia.resourceType ===
          "image"
            ? cleanMedia.url
            : "";

        if (
          oldMedia?.publicId &&
          oldMedia.publicId !==
            cleanMedia.publicId
        ) {
          await deleteCloudinaryMedia(
            oldMedia,
          );
        }
      }

      await post.save();

      const updatedPost =
        await populatePost(
          post._id,
        );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Post updated successfully.",
          post:
            updatedPost,
        });
    } catch (error) {
      console.error(
        "Update Post Error:",
        error,
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to update post.",
        });
    }
  };

// =====================================================
// DELETE POST
// =====================================================

const deletePost =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid post ID.",
          });
      }

      const post =
        await Post.findById(
          id,
        );

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Post not found.",
          });
      }

      const userId =
        getUserId(req);

      if (
        post.author.toString() !==
        userId.toString()
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "You can only delete your own post.",
          });
      }

      await deleteCloudinaryMedia(
        post.media,
      );

      await Post.findByIdAndDelete(
        id,
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Post deleted successfully.",
          postId: id,
        });
    } catch (error) {
      console.error(
        "Delete Post Error:",
        error,
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to delete post.",
        });
    }
  };

// =====================================================
// LIKE / UNLIKE
// =====================================================

const toggleLike =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid post ID.",
          });
      }

      const post =
        await Post.findById(
          id,
        );

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Post not found.",
          });
      }

      const userId =
        getUserId(req);

      const alreadyLiked =
        post.likes.some(
          (like) =>
            like.toString() ===
            userId.toString(),
        );

      if (alreadyLiked) {
        post.likes =
          post.likes.filter(
            (like) =>
              like.toString() !==
              userId.toString(),
          );
      } else {
        post.likes.push(
          userId,
        );
      }

      await post.save();

      const updatedPost =
        await populatePost(
          post._id,
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            alreadyLiked
              ? "Post unliked successfully."
              : "Post liked successfully.",

          liked:
            !alreadyLiked,

          likeCount:
            updatedPost.likes
              .length,

          post:
            updatedPost,
        });
    } catch (error) {
      console.error(
        "Toggle Like Error:",
        error,
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to like/unlike post.",
        });
    }
  };

// =====================================================
// ADD COMMENT
// =====================================================

const addComment =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid post ID.",
          });
      }

      const text =
        req.body.text?.trim() ||
        "";

      if (!text) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Comment text is required.",
          });
      }

      if (
        text.length > 500
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Comment cannot exceed 500 characters.",
          });
      }

      const post =
        await Post.findById(
          id,
        );

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Post not found.",
          });
      }

      const userId =
        getUserId(req);

      post.comments.push({
        user: userId,
        text,
      });

      await post.save();

      const updatedPost =
        await populatePost(
          post._id,
        );

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Comment added successfully.",
          post:
            updatedPost,
        });
    } catch (error) {
      console.error(
        "Add Comment Error:",
        error,
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to add comment.",
        });
    }
  };

// =====================================================
// DELETE COMMENT
// =====================================================

const deleteComment =
  async (req, res) => {
    try {
      const {
        id,
        commentId,
      } = req.params;

      if (
        !isValidObjectId(id) ||
        !isValidObjectId(
          commentId,
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid post or comment ID.",
          });
      }

      const post =
        await Post.findById(
          id,
        );

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Post not found.",
          });
      }

      const userId =
        getUserId(req);

      const comment =
        post.comments.id(
          commentId,
        );

      if (!comment) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Comment not found.",
          });
      }

      if (
        comment.user.toString() !==
        userId.toString()
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "You can only delete your own comment.",
          });
      }

      post.comments.pull(
        commentId,
      );

      await post.save();

      const updatedPost =
        await populatePost(
          post._id,
        );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Comment deleted successfully.",
          post:
            updatedPost,
        });
    } catch (error) {
      console.error(
        "Delete Comment Error:",
        error,
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to delete comment.",
        });
    }
  };

// =====================================================
// EXPORT
// =====================================================

module.exports = {
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
};