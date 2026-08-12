import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

// =========================================================
// PROTECTED ROUTE
// =========================================================

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  const location = useLocation();

  // =======================================================
  // AUTHENTICATION CHECK
  // =======================================================
  //
  // AuthContext backend se current user verify kar raha ho
  // to temporarily loading screen show hogi.
  //

  if (loading) {
    return (
      <div className="page-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  // =======================================================
  // USER NOT AUTHENTICATED
  // =======================================================
  //
  // User login nahi hai to Login page par redirect.
  //
  // state mein current location bhi save kar rahe hain.
  // Future mein login ke baad user ko original page
  // par redirect kiya ja sakta hai.
  //

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // =======================================================
  // USER AUTHENTICATED
  // =======================================================

  return children;
}