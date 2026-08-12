import { useCallback, useEffect, useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import Loader from "../components/Loader";

import { getPosts } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Feed() {
  const { user, loading: authLoading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  // =========================================================
  // LOGIN / REGISTER SUCCESS MESSAGE
  // =========================================================

  useEffect(() => {
  const message = location.state?.successMessage;

  if (!message) {
    return;
  }

  const timer = setTimeout(() => {
    setSuccess(message);
  }, 0);

  navigate(location.pathname, {
    replace: true,
    state: {},
  });

  return () => {
    clearTimeout(timer);
  };
}, [location, navigate]);

  // =========================================================
  // FETCH POSTS
  // =========================================================

  const fetchPosts = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const data = await getPosts();

      setPosts(
        Array.isArray(data.posts)
          ? data.posts
          : [],
      );
    } catch (err) {
      console.error(
        "Fetch posts error:",
        err,
      );

      setError(
        err.message ||
          "Unable to load posts.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // LOAD POSTS
  // =========================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const loadFeed = async () => {
      await fetchPosts();
    };

    loadFeed();
  }, [authLoading, fetchPosts]);

  // =========================================================
  // CREATE POST
  // =========================================================

  const handlePostCreated = (post) => {
    if (!post) return;

    setPosts((currentPosts) => [
      post,
      ...currentPosts,
    ]);

    setError("");
  };

  // =========================================================
  // UPDATE POST
  // =========================================================

  const handlePostUpdated = (
    updatedPost,
  ) => {
    if (!updatedPost) return;

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post._id === updatedPost._id
          ? updatedPost
          : post,
      ),
    );
  };

  // =========================================================
  // DELETE POST
  // =========================================================

  const handlePostDeleted = (postId) => {
    setPosts((currentPosts) =>
      currentPosts.filter(
        (post) => post._id !== postId,
      ),
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (authLoading) {
    return (
      <>
        <Navbar />

        <div className="page-center">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="social-feed-page">
      <Navbar />

      <main className="social-feed-layout">

        {/* =================================================
            LEFT SIDEBAR
        ================================================= */}

        <aside className="feed-sidebar feed-sidebar-left">
          {user ? (
            <>
              {/* LOGGED-IN USER */}

              <div className="sidebar-card">
                <div className="sidebar-profile">
                  <div className="sidebar-avatar">
                    {user.profilePicture ? (
                      <img
                        src={
                          user.profilePicture
                        }
                        alt={
                          user.name ||
                          "Profile"
                        }
                      />
                    ) : (
                      <span>
                        {user.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "U"}
                      </span>
                    )}
                  </div>

                  <div className="sidebar-profile-info">
                    <strong>
                      {user.name ||
                        "User"}
                    </strong>

                    <span>
                      @
                      {user.username ||
                        "user"}
                    </span>
                  </div>
                </div>
              </div>

              <nav className="feed-navigation">
                <Link
                  to="/feed"
                  className="feed-nav-item active"
                >
                  <span className="feed-nav-icon">
                    🏠
                  </span>

                  <span>Home</span>
                </Link>

                <Link
                  to="/profile"
                  className="feed-nav-item"
                >
                  <span className="feed-nav-icon">
                    👤
                  </span>

                  <span>Profile</span>
                </Link>
              </nav>

              <div className="sidebar-info-card">
                <span>✨</span>

                <div>
                  <strong>
                    Your community
                  </strong>

                  <p>
                    Share your thoughts
                    and connect with
                    people.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* =================================================
                  GUEST
              ================================================= */}

              <div className="sidebar-card guest-sidebar-card">
                <div className="guest-sidebar-avatar">
                  👋
                </div>

                <div className="guest-sidebar-content">
                  <span className="guest-sidebar-label">
                    YOU ARE BROWSING AS
                  </span>

                  <strong>
                    Guest Visitor
                  </strong>

                  <span className="guest-sidebar-status">
                    🌐 Public Feed
                  </span>
                </div>
              </div>

              <nav className="feed-navigation">
                <Link
                  to="/feed"
                  className="feed-nav-item active"
                >
                  <span className="feed-nav-icon">
                    🏠
                  </span>

                  <span>Home</span>
                </Link>

                <Link
                  to="/login"
                  className="feed-nav-item"
                >
                  <span className="feed-nav-icon">
                    🔐
                  </span>

                  <span>Login</span>
                </Link>
              </nav>

              <div className="sidebar-info-card">
                <span>✨</span>

                <div>
                  <strong>
                    Join the community
                  </strong>

                  <p>
                    Login to create
                    posts, like and
                    comment.
                  </p>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* =================================================
            MAIN FEED
        ================================================= */}

        <section className="feed-main">

          <header className="modern-feed-header">
            <div>
              <span className="feed-eyebrow">
                {user
                  ? "YOUR COMMUNITY"
                  : "PUBLIC FEED"}
              </span>

              <h1>Home Feed</h1>

              <p>
                {user
                  ? "See what your community is sharing today."
                  : "Explore posts from the Rhombix community."}
              </p>
            </div>

            <button
              type="button"
              className="refresh-feed-btn"
              onClick={fetchPosts}
              disabled={loading}
              title="Refresh feed"
            >
              <span
                className={
                  loading
                    ? "refresh-icon spinning"
                    : "refresh-icon"
                }
              >
                ↻
              </span>

              Refresh
            </button>
          </header>

          {/* =================================================
              SUCCESS ALERT
          ================================================= */}

          {success && (
            <div
              className="feed-success-alert"
              role="alert"
            >
              <span className="feed-success-icon">
                ✓
              </span>

              <span className="feed-success-message">
                {success}
              </span>

              <button
                type="button"
                className="feed-success-close"
                onClick={() =>
                  setSuccess("")
                }
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          )}

          {/* =================================================
              GUEST CTA
          ================================================= */}

          {!user && (
            <div className="guest-feed-banner">
              <div className="guest-feed-banner-main">
                <div className="guest-feed-banner-icon">
                  🔐
                </div>

                <div className="guest-feed-banner-content">
                  <span className="guest-feed-banner-label">
                    WELCOME TO RHOMBIX SOCIAL
                  </span>

                  <h2>
                    Join the conversation
                  </h2>

                  <p>
                    Sign in to create
                    posts, like posts,
                    comment, and connect
                    with the community.
                  </p>
                </div>
              </div>

              <div className="guest-feed-banner-actions">
                <button
                  type="button"
                  className="guest-login-btn"
                  onClick={() =>
                    navigate("/login")
                  }
                >
                  Login
                </button>

                <button
                  type="button"
                  className="guest-register-btn"
                  onClick={() =>
                    navigate("/register")
                  }
                >
                  Create account
                </button>
              </div>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="feed-error-card"
              role="alert"
            >
              <div className="feed-error-icon">
                !
              </div>

              <div className="feed-error-content">
                <strong>
                  We couldn't load the feed
                </strong>

                <span>{error}</span>
              </div>

              <button
                type="button"
                onClick={fetchPosts}
              >
                Try again
              </button>
            </div>
          )}

          {/* =================================================
              CREATE POST
          ================================================= */}

          {user && (
            <CreatePost
              onPostCreated={
                handlePostCreated
              }
            />
          )}

          {/* =================================================
              POSTS HEADING
          ================================================= */}

          <div className="feed-section-heading">
            <div>
              <h2>Latest Posts</h2>

              <span>
                {posts.length}{" "}
                {posts.length === 1
                  ? "post"
                  : "posts"}
              </span>
            </div>
          </div>

          {/* =================================================
              POSTS
          ================================================= */}

          {loading ? (
            <div className="feed-loading-wrapper">
              <Loader />
            </div>
          ) : posts.length === 0 ? (
            <div className="feed-empty-state">
              <div className="empty-state-icon">
                ✨
              </div>

              <h2>No posts yet</h2>

              <p>
                {user
                  ? "Be the first to share something with the community."
                  : "There are no public posts to show yet."}
              </p>

              {!user && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/register")
                  }
                >
                  Create Account
                </button>
              )}
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={user}
                  onPostUpdated={
                    handlePostUpdated
                  }
                  onPostDeleted={
                    handlePostDeleted
                  }
                />
              ))}
            </div>
          )}

        </section>

        {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

        <aside className="feed-sidebar feed-sidebar-right">

          <div className="trending-card">
            <div className="trending-header">
              <h3>Community</h3>

              <span>✨</span>
            </div>

            <div className="community-stat">
              <strong>
                {posts.length}
              </strong>

              <span>
                Public posts
              </span>
            </div>

            <div className="community-stat">
              <strong>❤️</strong>

              <span>
                Share. Connect. Engage.
              </span>
            </div>
          </div>

          {!user && (
            <div className="social-tip-card">
              <div className="tip-icon">
                🔐
              </div>

              <div>
                <strong>
                  Want to participate?
                </strong>

                <p>
                  Login to like,
                  comment and create
                  posts.
                </p>

                <Link to="/login">
                  Login
                </Link>
              </div>
            </div>
          )}

          {user && (
            <div className="social-tip-card">
              <div className="tip-icon">
                💡
              </div>

              <div>
                <strong>
                  Social tip
                </strong>

                <p>
                  Keep conversations
                  respectful and
                  positive.
                </p>
              </div>
            </div>
          )}

          <p className="feed-footer-text">
            ©{" "}
            {new Date().getFullYear()}{" "}
            Rhombix Social Network
          </p>

        </aside>

      </main>
    </div>
  );
}