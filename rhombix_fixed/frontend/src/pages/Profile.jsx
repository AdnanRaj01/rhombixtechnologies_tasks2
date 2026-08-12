import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCurrentUser } from "../services/api";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
  ================================================
  FETCH PROFILE
  ================================================
  */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const data = await getCurrentUser();

        setUser(data.user);
      } catch (error) {
        console.error("Profile error:", error);

        setError(
          error.message || "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /*
  ================================================
  LOADING
  ================================================
  */

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="page-center">
          <p>Loading profile...</p>
        </div>
      </>
    );
  }

  /*
  ================================================
  ERROR
  ================================================
  */

  if (error) {
    return (
      <>
        <Navbar />

        <div className="page-center">
          <div className="error-message">
            {error}
          </div>
        </div>
      </>
    );
  }

  /*
  ================================================
  PROFILE UI
  ================================================
  */

  return (
    <>
      <Navbar />

      <main className="profile-page">

        <div className="profile-container">

          <div className="profile-card">

            <div className="profile-header">

              <div className="profile-avatar">
                {user?.name
                  ? user.name
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </div>

              <div>

                <h1>
                  {user?.name || "User"}
                </h1>

                <p>
                  {user?.email ||
                    "No email available"}
                </p>

              </div>

            </div>

            <div className="profile-info">

              <div className="profile-info-item">

                <span>
                  Name
                </span>

                <strong>
                  {user?.name ||
                    "Not provided"}
                </strong>

              </div>

              <div className="profile-info-item">

                <span>
                  Email
                </span>

                <strong>
                  {user?.email ||
                    "Not provided"}
                </strong>

              </div>

              <div className="profile-info-item">

                <span>
                  Username
                </span>

                <strong>
                  {user?.username
                    ? `@${user.username}`
                    : "Not provided"}
                </strong>

              </div>

              <div className="profile-info-item">

                <span>
                  Bio
                </span>

                <strong>
                  {user?.bio ||
                    "No bio added yet."}
                </strong>

              </div>

            </div>

            <Link
              to="/profile/edit"
              className="edit-profile-btn"
            >
              Edit Profile
            </Link>

          </div>

        </div>

      </main>
    </>
  );
}