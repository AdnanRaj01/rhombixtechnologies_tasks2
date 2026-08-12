import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaImage,
  FaVideo,
  FaPaperPlane,
  FaTimes,
  FaSmile,
} from "react-icons/fa";

import {
  createPost,
  uploadPostMedia,
} from "../services/api";

import { useAuth } from "../context/AuthContext";

const MAX_CONTENT_LENGTH =
  1000;

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const MAX_VIDEO_SIZE =
  100 * 1024 * 1024;

export default function CreatePost({
  onPostCreated,
}) {
  const { user } =
    useAuth();

  const imageInputRef =
    useRef(null);

  const videoInputRef =
    useRef(null);

  const [content, setContent] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [mediaType, setMediaType] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ===================================================
  // CLEANUP
  // ===================================================

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl,
        );
      }
    };
  }, [previewUrl]);

  // ===================================================
  // SELECT MEDIA
  // ===================================================

  const handleMediaSelect = (
    event,
    type,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const isImage =
      type === "image";

    const isValidType =
      isImage
        ? file.type.startsWith(
            "image/",
          )
        : file.type.startsWith(
            "video/",
          );

    if (!isValidType) {
      setError(
        isImage
          ? "Please select a valid image."
          : "Please select a valid video.",
      );

      event.target.value =
        "";

      return;
    }

    const maxSize =
      isImage
        ? MAX_IMAGE_SIZE
        : MAX_VIDEO_SIZE;

    if (file.size > maxSize) {
      setError(
        isImage
          ? "Image must be 10MB or less."
          : "Video must be 100MB or less.",
      );

      event.target.value =
        "";

      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    setSelectedFile(file);

    setPreviewUrl(
      URL.createObjectURL(
        file,
      ),
    );

    setMediaType(
      isImage
        ? "image"
        : "video",
    );
  };

  // ===================================================
  // REMOVE MEDIA
  // ===================================================

  const removeMedia = () => {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setMediaType("");

    if (
      imageInputRef.current
    ) {
      imageInputRef.current.value =
        "";
    }

    if (
      videoInputRef.current
    ) {
      videoInputRef.current.value =
        "";
    }
  };

  // ===================================================
  // SUBMIT
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

      // Text OR media required
      if (
        !cleanContent &&
        !selectedFile
      ) {
        setError(
          "Write something or add a photo/video.",
        );

        return;
      }

      try {
        setLoading(true);
        setError("");

        let media = null;

        // -----------------------------------------------
        // UPLOAD MEDIA
        // -----------------------------------------------

        if (selectedFile) {
          setUploading(true);

          const uploadResult =
            await uploadPostMedia(
              selectedFile,
            );

          media =
            uploadResult.media;

          setUploading(false);
        }

        // -----------------------------------------------
        // CREATE POST
        // -----------------------------------------------

        const data =
          await createPost({
            content:
              cleanContent,

            media,
          });

        onPostCreated?.(
          data.post,
        );

        // -----------------------------------------------
        // RESET
        // -----------------------------------------------

        setContent("");

        removeMedia();
      } catch (err) {
        console.error(
          "Create Post Error:",
          err,
        );

        setError(
          err.message ||
            "Unable to publish post.",
        );

        setUploading(false);
      } finally {
        setLoading(false);
      }
    };

  const avatar =
    user?.profilePicture;

  const initial =
    user?.name
      ?.charAt(0)
      ?.toUpperCase() ||
    "U";

  return (
    <section className="create-post-card">

      {/* HEADER */}

      <div className="create-post-header">

        <div className="create-post-user">

          <div className="feed-avatar">

            {avatar ? (
              <img
                src={avatar}
                alt={
                  user?.name ||
                  "User"
                }
              />
            ) : (
              initial
            )}

          </div>

          <div>
            <strong>
              {user?.name ||
                "You"}
            </strong>

            <span>
              Create a new post
            </span>
          </div>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div
          className="create-post-error"
          role="alert"
        >
          <span>!</span>

          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            aria-label="Close error"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* FORM */}

      <form
        className="create-post-form"
        onSubmit={handleSubmit}
      >

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
          disabled={loading}
        />

        {/* MEDIA PREVIEW */}

        {previewUrl && (
          <div className="media-preview">

            <button
              type="button"
              className="media-remove-btn"
              onClick={
                removeMedia
              }
              disabled={loading}
              aria-label="Remove selected media"
              title="Remove"
            >
              <FaTimes />
            </button>

            {mediaType ===
            "image" ? (
              <img
                src={previewUrl}
                alt="Selected preview"
              />
            ) : (
              <video
                src={previewUrl}
                controls
                playsInline
                preload="metadata"
              />
            )}

          </div>
        )}

        {/* TOOLBAR */}

        <div className="create-post-toolbar">

          <div className="media-actions">

            {/* PHOTO */}

            <button
              type="button"
              className="media-action photo-action"
              onClick={() =>
                imageInputRef.current?.click()
              }
              disabled={loading}
            >
              <FaImage />

              <span>
                Photo
              </span>
            </button>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) =>
                handleMediaSelect(
                  event,
                  "image",
                )
              }
            />

            {/* VIDEO */}

            <button
              type="button"
              className="media-action video-action"
              onClick={() =>
                videoInputRef.current?.click()
              }
              disabled={loading}
            >
              <FaVideo />

              <span>
                Video
              </span>
            </button>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              hidden
              onChange={(event) =>
                handleMediaSelect(
                  event,
                  "video",
                )
              }
            />

            {/* FEELING */}

            <button
              type="button"
              className="media-action emoji-action"
              onClick={() =>
                setContent(
                  (previous) =>
                    `${previous}${previous ? " " : ""}😊`,
                )
              }
              disabled={loading}
            >
              <FaSmile />

              <span>
                Feeling
              </span>
            </button>

          </div>

          <span className="post-character-count">
            {content.length}/
            {MAX_CONTENT_LENGTH}
          </span>

        </div>

        {/* PUBLISH */}

        <button
          type="submit"
          className="publish-post-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="button-spinner" />

              {uploading
                ? "Uploading media..."
                : "Publishing..."}
            </>
          ) : (
            <>
              <FaPaperPlane />

              Publish
            </>
          )}
        </button>

      </form>

    </section>
  );
}