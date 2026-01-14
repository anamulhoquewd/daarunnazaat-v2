import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await refreshToken();

        return api(originalRequest);
      } catch (refreshError: any) {
        return Promise.reject(
          new Error(
            refreshError?.response?.data?.error?.message ||
              "Session expired. Please login again."
          )
        );
      }
    }

    return Promise.reject(error);
  }
);

const refreshToken = async () => {
  try {
    const refreshInstance = axios.create({ withCredentials: true });
    await refreshInstance.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`
    );

    return null;
  } catch (error) {
    console.error("Failed to refresh token: ", error);
    return null;
  }
};

export default api;
