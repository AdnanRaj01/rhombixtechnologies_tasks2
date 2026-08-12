import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaImage,
  FaVideo,
  FaTimes,
  FaSave,
} from "react-icons/fa";

import Navbar from "../components/Navbar";

import {
  getPost,
  updatePost,
  uploadPostMedia,
} from "../services/api";

const MAX_CONTENT_LENGTH =
  1000;

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const MAX_VIDEO_SIZE =
  100 * 1024 * 1024;

export default function EditPost() {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const [post, setPost] =
    useState(null);

  const [content, setContent] =
    useState("");

  const [existingMedia, setExistingMedia] =
    useState(null);

  const [newMediaFile, setNewMediaFile] =
    useState(null);

  const [newMediaPreview, setNewMediaPreview] =
    useState("");

  const [newMediaType, setNewMediaType] =
    useState("");

  const [removeExistingMedia, setRemoveExistingMedia] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ===================================================
  // LOAD POST
  // ===================================================

  useEffect(() => {
    let mounted = true;

    const loadPost =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getPost(id);

          if (
            !data?.post
          ) {
            throw new Error(
              "Post not found.",
            );
          }

          if (!mounted) {
            return;
          }

          setPost(
            data.post,
          );

          setContent(
            data.post.content ||
              "",
          );

          setExistingMedia(
            data.post.media ||
              (data.post.image
                ? {
                    url: data
                      .post
                      .image,

                    resourceType:
                      "image",
                  }
                : null),
          );
        } catch (err) {
          console.error(
            "Load Edit Post Error:",
            err,
          );

          if (mounted) {
            setError(
              err.message ||
                "Unable to load post.",
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadPost();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ===================================================
  // CLEAN PREVIEW
  // ===================================================

  useEffect(() => {
    return () => {
      if (
        newMediaPreview
      ) {
        URL.revokeObjectURL(
          newMediaPreview,
        );
      }
    };
  }, [newMediaPreview]);

  // ===================================================
  // SELECT NEW MEDIA
  // ===================================================

  const handleMediaSelect =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      setError("");
      setSuccess("");

      const isImage =
        file.type.startsWith(
          "image/",
        );

      const isVideo =
        file.type.startsWith(
          "video/",
        );

      if (
        !isImage &&
        !isVideo
      ) {
        setError(
          "Please select an image or video.",
        );

        event.target.value =
          "";

        return;
      }

      const maxSize =
        isImage
          ? MAX_IMAGE_SIZE
          : MAX_VIDEO_SIZE;

      if (
        file.size > maxSize
      ) {
        setError(
          isImage
            ? "Image must be 10MB or less."
            : "Video must be 100MB or less.",
        );

        event.target.value =
          "";

        return;
      }

      if (
        newMediaPreview
      ) {
        URL.revokeObjectURL(
          newMediaPreview,
        );
      }

      const preview =
        URL.createObjectURL(
          file,
        );

      setNewMediaFile(
        file,
      );

      setNewMediaPreview(
        preview,
      );

      setNewMediaType(
        isImage
          ? "image"
          : "video",
      );

      // New media replaces old media.
      setRemoveExistingMedia(
        false,
      );

      event.target.value =
        "";
    };

  // ===================================================
  // REMOVE NEW MEDIA
  // ===================================================

  const removeNewMedia =
    () => {
      if (
        newMediaPreview
      ) {
        URL.revokeObjectURL(
          newMediaPreview,
        );
      }

      setNewMediaFile(
        null,
      );

      setNewMediaPreview(
        "",
      );

      setNewMediaType(
        "",
      );

      // IMPORTANT:
      // Existing media remains untouched.
    };

  // ===================================================
  // REMOVE EXISTING MEDIA
  // ===================================================

  const removeCurrentMedia =
    () => {
      if (
        newMediaPreview
      ) {
        URL.revokeObjectURL(
          newMediaPreview,
        );
      }

      setNewMediaFile(
        null,
      );

      setNewMediaPreview(
        "",
      );

      setNewMediaType(
        "",
      );

      setExistingMedia(
        null,
      );

      setRemoveExistingMedia(
        true,
      );
    };

  // ===================================================
  // SAVE
  // ===================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const cleanContent =
        content.trim();

      if (
        cleanContent.length >
        MAX_CONTENT_LENGTH
      ) {
        setError(
          `Post cannot exceed ${MAX_CONTENT_LENGTH} characters.`,
        );

        return;
      }

      // Text OR existing/new media
      if (
        !cleanContent &&
        !existingMedia &&
        !newMediaFile
      ) {
        setError(
          "Post cannot be empty. Add text, a photo, or a video.",
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        let media =
          existingMedia;

        // -----------------------------------------------
        // UPLOAD NEW MEDIA
        // -----------------------------------------------

        if (newMediaFile) {
          const uploadResult =
            await uploadPostMedia(
              newMediaFile,
            );

          media =
            uploadResult.media;
        }

        // -----------------------------------------------
        // UPDATE
        // -----------------------------------------------

        const data =
          await updatePost(
            id,
            {
              content:
                cleanContent,

              media,

              removeMedia:
                removeExistingMedia &&
                !newMediaFile,
            },
          );

        setSuccess(
          "Post updated successfully.",
        );

        // Update local state
        if (data?.post) {
          setPost(
            data.post,
          );

          setContent(
            data.post.content ||
              "",
          );

          setExistingMedia(
            data.post.media ||
              null,
          );
        }

        // -----------------------------------------------
        // REDIRECT
        // -----------------------------------------------

        setTimeout(() => {
          navigate("/feed");
        }, 700);
      } catch (err) {
        console.error(
          "Update Post Error:",
          err,
        );

        setError(
          err.message ||
            "Unable to update post.",
        );
      } finally {
        setSaving(false);
      }
    };

  // ===================================================
  // CANCEL
  // ===================================================

  const handleCancel =
    () => {
      if (
        newMediaPreview
      ) {
        URL.revokeObjectURL(
          newMediaPreview,
        );
      }

      navigate("/feed");
    };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="edit-post-page">

          <div className="edit-post-container">

            <div className="edit-post-loading">

              <div className="loader-spinner" />

              <p>
                Loading your post...
              </p>

            </div>

          </div>

        </main>
      </>
    );
  }

  // ===================================================
  // ERROR / NOT FOUND
  // ===================================================

  if (!post) {
    return (
      <>
        <Navbar />

        <main className="edit-post-page">

          <div className="edit-post-container">

            <div className="edit-post-error">

              <h2>
                Unable to load post
              </h2>

              <p>
                {error ||
                  "Post not found."}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/feed",
                  )
                }
              >
                Back to Feed
              </button>

            </div>

          </div>

        </main>
      </>
    );
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>
      <Navbar />

      <main className="edit-post-page">

        <div className="edit-post-container">

          {/* HEADER */}

          <div className="edit-post-header">

            <button
              type="button"
              className="back-feed-btn"
              onClick={() =>
                navigate(
                  "/feed",
                )
              }
            >
              <FaArrowLeft />

              Back
            </button>

            <div>
              <h1>
                Edit Post
              </h1>

              <p>
                Update your post and
                media.
              </p>
            </div>

          </div>

          {/* CARD */}

          <form
            className="edit-post-card"
            onSubmit={
              handleSubmit
            }
          >

            {/* AUTHOR */}

            <div className="edit-post-author">

              <div className="edit-author-avatar">

                {post.author
                  ?.profilePicture ? (
                  <img
                    src={
                      post.author
                        .profilePicture
                    }
                    alt={
                      post.author
                        ?.name ||
                      "User"
                    }
                  />
                ) : (
                  <span>
                    {post.author?.name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "U"}
                  </span>
                )}

              </div>

              <div>
                <strong>
                  {post.author?.name ||
                    "User"}
                </strong>

                <span>
                  @
                  {post.author
                    ?.username ||
                    "user"}
                </span>
              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="edit-post-alert error">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="edit-post-alert success">
                {success}
              </div>
            )}

            {/* TEXT */}

            <div className="edit-content-wrapper">

              <textarea
                value={content}
                maxLength={
                  MAX_CONTENT_LENGTH
                }
                onChange={(event) =>
                  setContent(
                    event.target.value,
                  )
                }
                placeholder="What's on your mind?"
                disabled={saving}
              />

              <div className="character-count">
                {content.length}/
                {MAX_CONTENT_LENGTH}
              </div>

            </div>

            {/* CURRENT MEDIA */}

            {existingMedia &&
              !newMediaPreview && (
                <div className="edit-media-box">

                  <button
                    type="button"
                    className="remove-media-btn"
                    onClick={
                      removeCurrentMedia
                    }
                    disabled={saving}
                    title="Remove current media"
                    aria-label="Remove current media"
                  >
                    <FaTimes />
                  </button>

                  {existingMedia.resourceType ===
                  "video" ? (
                    <video
                      src={
                        existingMedia.url
                      }
                      controls
                      playsInline
                    />
                  ) : (
                    <img
                      src={
                        existingMedia.url
                      }
                      alt="Current post"
                    />
                  )}

                </div>
              )}

            {/* NEW MEDIA */}

            {newMediaPreview && (
              <div className="edit-media-box">

                <button
                  type="button"
                  className="remove-media-btn"
                  onClick={
                    removeNewMedia
                  }
                  disabled={saving}
                  title="Remove selected media"
                  aria-label="Remove selected media"
                >
                  <FaTimes />
                </button>

                {newMediaType ===
                "video" ? (
                  <video
                    src={
                      newMediaPreview
                    }
                    controls
                    playsInline
                  />
                ) : (
                  <img
                    src={
                      newMediaPreview
                    }
                    alt="New media preview"
                  />
                )}

              </div>
            )}

            {/* MEDIA PICKER */}

            <div className="edit-media-actions">

              <label className="media-option">

                <FaImage />

                <span>
                  Photo
                </span>

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={
                    handleMediaSelect
                  }
                  disabled={saving}
                />

              </label>

              <label className="media-option">

                <FaVideo />

                <span>
                  Video
                </span>

                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={
                    handleMediaSelect
                  }
                  disabled={saving}
                />

              </label>

            </div>

            {/* FOOTER */}

            <div className="edit-post-footer">

              <button
                type="button"
                className="cancel-btn"
                onClick={
                  handleCancel
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-post-btn"
                disabled={
                  saving
                }
              >
                <FaSave />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

        </div>

      </main>
    </>
  );
}