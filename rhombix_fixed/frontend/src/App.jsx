import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Feed from "./pages/Feed";
import EditPost from "./pages/EditPost";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =================================================
            PUBLIC FEED
        =================================================

            Guest bhi Feed dekh sakta hai.
            Logged-in user bhi Feed dekh sakta hai.

        */}

        <Route
          path="/feed"
          element={<Feed />}
        />

        {/* =================================================
            PROTECTED EDIT POST
        ================================================= */}

        <Route
          path="/posts/edit/:id"
          element={
            <ProtectedRoute>
              <EditPost />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PROTECTED PROFILE
        ================================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PROTECTED EDIT PROFILE
        ================================================= */}

        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            HOME
        ================================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/feed"
              replace
            />
          }
        />

        {/* =================================================
            404
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/feed"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;