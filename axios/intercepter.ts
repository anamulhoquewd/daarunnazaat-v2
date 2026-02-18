import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  pendingQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const is401 = error.response?.status === 401;
    const isRefreshUrl = originalRequest.url?.includes("/auth/refresh");
    const alreadyRetried = originalRequest._retry;

    // Refresh endpoint নিজেই 401 → session শেষ
    if (is401 && isRefreshUrl) {
      isRefreshing = false; // 🔥 reset করো
      pendingQueue = []; // 🔥 queue clear করো

      if (typeof window !== "undefined") {
        // Redirect করার আগে cookies clear করো (optional)
        document.cookie = "accessToken=; path=/; max-age=0";
        document.cookie = "refreshToken=; path=/; max-age=0";
        window.location.href = "/auth/sign-in";
      }
      return Promise.reject(new Error("Session expired"));
    }

    if (is401 && !alreadyRetried) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue তে রাখো
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        await callRefresh();
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        if (typeof window !== "undefined") {
          // Clear cookies before redirect
          document.cookie = "accessToken=; path=/; max-age=0";
          document.cookie = "refreshToken=; path=/; max-age=0";
          window.location.href = "/auth/sign-in";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

const callRefresh = async () => {
  const instance = axios.create({ withCredentials: true });
  await instance.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`);
};

export default api;
