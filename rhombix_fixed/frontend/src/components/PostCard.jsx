import { useState } from "react";

import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaTrash,
  FaPaperPlane,
  FaEdit,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import {
  toggleLike,
  addComment,
  deleteComment,
  deletePost,
} from "../services/api";

// =====================================================
// GET ID
// =====================================================

const getId = (value) => {
  if (!value) {
    return "";
  }

  return String(value._id || value.id || value);
};

// =====================================================
// POST CARD
// =====================================================

export default function PostCard({
  post,
  currentUser,
  onPostUpdated,
  onPostDeleted,
}) {
  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [commentText, setCommentText] = useState("");

  const [loadingAction, setLoadingAction] = useState("");

  const [error, setError] = useState("");

  // ===================================================
  // AUTHENTICATION
  // ===================================================

  const isAuthenticated = Boolean(currentUser);

  const currentUserId = getId(currentUser);

  // ===================================================
  // AUTHOR / OWNER
  // ===================================================

  const authorId = getId(post.author);

  const isOwner = Boolean(currentUser) && authorId === currentUserId;

  // ===================================================
  // LIKE STATUS
  // ===================================================

  const isLiked = (post.likes || []).some(
    (like) => getId(like) === currentUserId,
  );

  // ===================================================
  // MEDIA
  // ===================================================

  const media =
    post.media ||
    (post.image
      ? {
          url: post.image,
          resourceType: "image",
        }
      : null);

  // ===================================================
  // ACTION RUNNER
  // ===================================================

  const runAction = async (name, action) => {
    try {
      setLoadingAction(name);
      setError("");

      await action();
    } catch (err) {
      console.error(`${name} error:`, err);

      setError(err.message || "Something went wrong.");
    } finally {
      setLoadingAction("");
    }
  };

  // ===================================================
  // LOGIN REDIRECT
  // ===================================================

  const redirectToLogin = () => {
    navigate("/login", {
      state: {
        from: "/feed",
      },
    });
  };

  // ===================================================
  // LIKE / UNLIKE
  // ===================================================

  const handleLike = () => {
    // Guest user
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    return runAction("like", async () => {
      const data = await toggleLike(post._id);

      onPostUpdated?.(data.post);
    });
  };

  // ===================================================
  // COMMENT
  // ===================================================

  const handleComment = async (event) => {
    event.preventDefault();

    // Guest user
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    const text = commentText.trim();

    if (!text) {
      return;
    }

    await runAction("comment", async () => {
      const data = await addComment(post._id, text);

      onPostUpdated?.(data.post);

      setCommentText("");
    });
  };

  // ===================================================
  // DELETE COMMENT
  // ===================================================

  const handleDeleteComment = (commentId) => {
    if (!isAuthenticated) {
      return;
    }

    return runAction(`comment-${commentId}`, async () => {
      const data = await deleteComment(post._id, commentId);

      onPostUpdated?.(data.post);
    });
  };

  // ===================================================
  // DELETE POST
  // ===================================================

  const handleDeletePost = () => {
    if (!isOwner) {
      return;
    }

    const confirmed = window.confirm("Delete this post permanently?");

    if (!confirmed) {
      return;
    }

    return runAction("delete", async () => {
      await deletePost(post._id);

      onPostDeleted?.(post._id);
    });
  };

  // ===================================================
  // EDIT POST
  // ===================================================

  const handleEditPost = () => {
    if (!isOwner) {
      return;
    }

    navigate(`/posts/edit/${post._id}`);
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <article className="post-card">
      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="post-inline-error" role="alert">
          {error}
        </div>
      )}

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="post-header">
        <div className="post-user">
          {/* AVATAR */}

          <div className="post-avatar">
            {post.author?.profilePicture ? (
              <img
                src={post.author.profilePicture}
                alt={post.author?.name || "User"}
              />
            ) : (
              <span>{post.author?.name?.charAt(0)?.toUpperCase() || "U"}</span>
            )}
          </div>

          {/* AUTHOR INFO */}

          <div className="post-author-info">
            <strong>{post.author?.name || "Unknown User"}</strong>

            <span>@{post.author?.username || "user"}</span>
          </div>
        </div>

        {/* =================================================
            OWNER ACTIONS
        ================================================= */}

        {isOwner && (
          <div className="post-owner-actions">
            {/* EDIT */}

            <button
              type="button"
              className="edit-post-btn"
              onClick={handleEditPost}
              disabled={Boolean(loadingAction)}
              title="Edit post"
              aria-label="Edit post"
            >
              <FaEdit />
            </button>

            {/* DELETE */}

            <button
              type="button"
              className="delete-post-btn"
              onClick={handleDeletePost}
              disabled={Boolean(loadingAction)}
              title="Delete post"
              aria-label="Delete post"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="post-content">
        {/* TEXT */}

        {post.content && <p>{post.content}</p>}

        {/* =================================================
            IMAGE
        ================================================= */}

        {media?.url && media.resourceType === "image" && (
          <div className="post-media-wrapper">
            <img
              src={media.url}
              alt="Post attachment"
              className="post-media-image"
              loading="lazy"
            />
          </div>
        )}

        {/* =================================================
            VIDEO
        ================================================= */}

        {media?.url && media.resourceType === "video" && (
          <div className="post-media-wrapper">
            <video
              src={media.url}
              className="post-media-video"
              controls
              playsInline
              preload="metadata"
            />
          </div>
        )}
      </div>

      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="post-actions">
        {/* =================================================
            LIKE
        ================================================= */}

        <button
          type="button"
          className={isLiked ? "liked" : ""}
          onClick={handleLike}
          disabled={loadingAction === "like"}
        >
          {isLiked ? <FaHeart /> : <FaRegHeart />}

          <span>{post.likes?.length || 0}</span>

          <span>Like</span>
        </button>

        {/* =================================================
            COMMENT BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              redirectToLogin();
              return;
            }

            document.getElementById(`comment-${post._id}`)?.focus();
          }}
          disabled={loadingAction === "comment"}
        >
          <FaComment />

          <span>{post.comments?.length || 0}</span>

          <span>Comment</span>
        </button>
      </div>

      {/* =================================================
          COMMENTS SECTION
      ================================================= */}

      <div className="comments-section">
        {/* =================================================
            EXISTING COMMENTS
        ================================================= */}

        {post.comments?.length > 0 && (
          <div className="comments-list">
            {post.comments.map((comment) => {
              const commentUserId = getId(comment.user);

              const canDelete =
                isAuthenticated && commentUserId === currentUserId;

              const commentLoading = loadingAction === `comment-${comment._id}`;

              return (
                <div className="comment" key={comment._id}>
                  {/* COMMENT AVATAR */}

                  <div className="comment-avatar">
                    {comment.user?.profilePicture ? (
                      <img src={comment.user.profilePicture} alt="" />
                    ) : (
                      <span>
                        {comment.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>

                  {/* COMMENT BODY */}

                  <div className="comment-body">
                    <strong>{comment.user?.name || "User"}</strong>

                    <p>{comment.text}</p>
                  </div>

                  {/* DELETE OWN COMMENT */}

                  {canDelete && (
                    <button
                      type="button"
                      className="delete-comment-btn"
                      onClick={() => handleDeleteComment(comment._id)}
                      disabled={commentLoading}
                      title="Delete comment"
                      aria-label="Delete comment"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* =================================================
            AUTHENTICATED COMMENT FORM
        ================================================= */}

        {currentUser ? (
          <form className="comment-form" onSubmit={handleComment}>
            <input
              id={`comment-${post._id}`}
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              maxLength={500}
              onChange={(event) => setCommentText(event.target.value)}
              disabled={loadingAction === "comment"}
            />

            <button
              type="submit"
              disabled={loadingAction === "comment" || !commentText.trim()}
            >
              <FaPaperPlane />
            </button>
          </form>
        ) : (
          <div className="guest-comment-login">
            <div className="guest-comment-icon">🔐</div>

            <div className="guest-comment-content">
              <strong>Login to join the conversation</strong>

              <span>
                Like posts and share your thoughts with the community.
              </span>
            </div>

            <button
              type="button"
              className="guest-comment-login-btn"
              onClick={() =>
                navigate("/login", {
                  state: {
                    from: "/feed",
                  },
                })
              }
            >
              Login
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
