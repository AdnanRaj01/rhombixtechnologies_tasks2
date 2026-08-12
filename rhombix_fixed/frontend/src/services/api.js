// =====================================================
// API BASE URL
// =====================================================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// =====================================================
// TOKEN
// =====================================================

const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
};

// =====================================================
// API REQUEST
// =====================================================

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),

    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(error.message || "Request failed.", {
      cause: error,
    });
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}.`,
    );
  }

  return data;
};

// =====================================================
// AUTH
// =====================================================

export const registerUser = async (userData) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (credentials) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

// =====================================================
// USER
// =====================================================

export const getCurrentUser = async () => {
  return apiRequest("/users/me", {
    method: "GET",
  });
};

export const getProfile = async () => {
  return apiRequest("/users/me", {
    method: "GET",
  });
};

export const updateProfile = async (userData) => {
  return apiRequest("/users/profile", {
    method: "PUT",
    body: JSON.stringify(userData),
  });
};

// =====================================================
// POSTS
// =====================================================

export const getPosts = async () => {
  return apiRequest("/posts", {
    method: "GET",
  });
};

export const getPost = async (postId) => {
  return apiRequest(`/posts/${postId}`, {
    method: "GET",
  });
};

export const createPost = async (postData) => {
  return apiRequest("/posts", {
    method: "POST",
    body: JSON.stringify(postData),
  });
};

export const updatePost = async (postId, postData) => {
  return apiRequest(`/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify(postData),
  });
};

export const deletePost = async (postId) => {
  return apiRequest(`/posts/${postId}`, {
    method: "DELETE",
  });
};

// =====================================================
// LIKE
// =====================================================

export const toggleLike = async (postId) => {
  return apiRequest(`/posts/${postId}/like`, {
    method: "POST",
  });
};

// =====================================================
// COMMENTS
// =====================================================

export const addComment = async (postId, text) => {
  return apiRequest(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({
      text,
    }),
  });
};

export const deleteComment = async (postId, commentId) => {
  return apiRequest(`/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });
};

// =====================================================
// CLOUDINARY MEDIA UPLOAD
// =====================================================

export const uploadPostMedia = async (file) => {
  if (!file) {
    throw new Error("Please select a file.");
  }

  const token = getToken();

  const formData = new FormData();

  formData.append("media", file);

  let response;

  try {
    response = await fetch(`${API_URL}/posts/upload-media`, {
      method: "POST",

      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},

      body: formData,
    });
  } catch (error) {
    throw new Error(error.message || "Something went wrong.", {
      cause: error,
    });
  }
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Media upload failed.");
  }

  return data;
};
