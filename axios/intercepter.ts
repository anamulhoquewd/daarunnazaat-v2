import { getStorage, removeStorage, setStorage } from "@/store/local";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// 🔹 Always attach latest token
api.interceptors.request.use((config) => {
  const token = getStorage("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔹 Refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshToken();
        if (newAccessToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }

        removeStorage("accessToken");
        return Promise.reject(
          new Error("Session expired. Please login again.")
        );
      } catch (refreshError) {
        removeStorage("accessToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const refreshToken = async () => {
  try {
    const refreshInstance = axios.create({ withCredentials: true });
    const response = await refreshInstance.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admins/auth/refresh`
    );

    if (response.data.success && response.data.tokens?.accessToken) {
      setStorage("accessToken", response.data.tokens.accessToken);
      return response.data.tokens.accessToken;
    }
    return null;
  } catch (error) {
    console.error("Failed to refresh token: ", error);
    return null;
  }
};

export default api;
