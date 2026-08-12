const mongoose = require("mongoose");

// =====================================================
// COMMENT SCHEMA
// =====================================================

const commentSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },
    },
    {
      timestamps: true,
    },
  );

// =====================================================
// MEDIA SCHEMA
// =====================================================

const mediaSchema =
  new mongoose.Schema(
    {
      url: {
        type: String,
        default: "",
        trim: true,
      },

      publicId: {
        type: String,
        default: "",
        trim: true,
      },

      resourceType: {
        type: String,
        enum: [
          "image",
          "video",
        ],
        required: true,
      },

      width: {
        type: Number,
        default: null,
      },

      height: {
        type: Number,
        default: null,
      },

      duration: {
        type: Number,
        default: null,
      },
    },
    {
      _id: false,
    },
  );

// =====================================================
// POST SCHEMA
// =====================================================

const postSchema =
  new mongoose.Schema(
    {
      author: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      // Caption is optional.
      // This allows:
      // Photo only
      // Video only
      // Text only
      // Text + Photo
      // Text + Video

      content: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      media: {
        type: mediaSchema,
        default: null,
      },

      // Backward compatibility
      image: {
        type: String,
        default: "",
      },

      likes: [
        {
          type:
            mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      comments: [
        commentSchema,
      ],
    },

    {
      timestamps: true,
    },
  );

// =====================================================
// INDEX
// =====================================================

postSchema.index({
  createdAt: -1,
});

// =====================================================
// MODEL
// =====================================================

module.exports =
  mongoose.model(
    "Post",
    postSchema,
  );