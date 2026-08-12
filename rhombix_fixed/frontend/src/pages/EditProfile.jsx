import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getCurrentUser,
  updateProfile,
} from "../services/api";

import {
  useAuth,
} from "../context/AuthContext";

import Navbar from "../components/Navbar";

export default function EditProfile() {
  const navigate =
    useNavigate();

  const {
    updateUser,
  } = useAuth();

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      username: "",
      bio: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ===================================================
  // LOAD PROFILE
  // ===================================================

  useEffect(() => {
    const fetchProfile =
      async () => {
        try {
          const data =
            await getCurrentUser();

          const user =
            data.user;

          setFormData({
            name:
              user?.name ||
              "",

            email:
              user?.email ||
              "",

            username:
              user?.username ||
              "",

            bio:
              user?.bio ||
              "",
          });
        } catch (error) {
          console.error(
            "Profile loading error:",
            error,
          );

          setError(
            error.message ||
              "Unable to load profile.",
          );
        } finally {
          setLoading(false);
        }
      };

    fetchProfile();
  }, []);

  // ===================================================
  // INPUT
  // ===================================================

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      }),
    );
  };

  // ===================================================
  // SAVE
  // ===================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      try {
        setSaving(true);

        const data =
          await updateProfile(
            formData,
          );

        if (
          data?.user
        ) {
          updateUser(
            data.user,
          );
        }

        setSuccess(
          "Profile updated successfully.",
        );

        setTimeout(() => {
          navigate(
            "/profile",
          );
        }, 700);
      } catch (error) {
        console.error(
          "Profile update error:",
          error,
        );

        setError(
          error.message ||
            "Failed to update profile.",
        );
      } finally {
        setSaving(false);
      }
    };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="page-center">
          <p>
            Loading profile...
          </p>
        </div>
      </>
    );
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>
      <Navbar />

      <main className="edit-profile-page">

        <div className="edit-profile-container">

          <div className="edit-profile-card">

            <h1>
              Edit Profile
            </h1>

            <p className="edit-profile-subtitle">
              Update your profile information
            </p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            <form
              onSubmit={
                handleSubmit
              }
              className="profile-form"
            >

              <div className="form-group">
                <label>
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Username
                </label>

                <input
                  type="text"
                  name="username"
                  value={
                    formData.username
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter username"
                />
              </div>

              <div className="form-group">
                <label>
                  Bio
                </label>

                <textarea
                  name="bio"
                  value={
                    formData.bio
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Tell something about yourself..."
                  rows="5"
                />
              </div>

              <div className="form-buttons">

                <button
                  type="submit"
                  className="save-profile-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    navigate(
                      "/profile",
                    )
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      </main>
    </>
  );
}