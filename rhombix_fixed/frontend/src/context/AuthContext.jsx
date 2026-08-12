import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
} from "../services/api";

const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] = useState(
  () => Boolean(localStorage.getItem("token"))
);

  // ===================================================
  // LOAD CURRENT USER
  // ===================================================

  useEffect(() => {
  let mounted = true;

  const token =
    localStorage.getItem("token");

  if (!token) {
    return;
  }

  const loadUser = async () => {
    try {
      const data =
        await getCurrentUser();

      if (!data?.user) {
        throw new Error(
          "User information not found."
        );
      }

      if (mounted) {
        setUser(data.user);
      }
    } catch (error) {
      console.error(
        "Authentication check failed:",
        error
      );

      localStorage.removeItem("token");

      if (mounted) {
        setUser(null);
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  loadUser();

  return () => {
    mounted = false;
  };
}, []);

  // ===================================================
  // LOGIN
  // ===================================================

  const login = (
    token,
    userData,
  ) => {
    if (!token) {
      throw new Error(
        "Login token is missing.",
      );
    }

    localStorage.setItem(
      "token",
      token,
    );

    setUser(
      userData || null,
    );
  };

  // ===================================================
  // UPDATE USER
  // ===================================================

  const updateUser = (
    userData,
  ) => {
    setUser(
      userData || null,
    );
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = () => {
    localStorage.removeItem(
      "token",
    );

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ===================================================
// USE AUTH
// ===================================================

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}