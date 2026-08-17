import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_URL,
});

// ==========================================================
// REQUEST INTERCEPTOR
// ==========================================================

api.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem("sellerAccessToken");

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    // ======================================================
    // IMPORTANT:
    // FormData must NOT have application/json
    // ======================================================

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================================
// RESPONSE INTERCEPTOR
// Automatically refresh expired access token
// ==========================================================

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) =>
    callback(newToken)
  );

  refreshSubscribers = [];
};

const clearSellerSession = () => {
  localStorage.removeItem("sellerAccessToken");
  localStorage.removeItem("sellerRefreshToken");
  localStorage.removeItem("seller");
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ------------------------------------------------------
    // Only handle 401 errors
    // ------------------------------------------------------

    if (
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // ------------------------------------------------------
    // Do not refresh refresh endpoint itself
    // ------------------------------------------------------

    if (
      originalRequest.url?.includes("/token/refresh/")
    ) {
      clearSellerSession();

      window.location.replace("/login");

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken =
      localStorage.getItem("sellerRefreshToken");

    // ------------------------------------------------------
    // No refresh token
    // ------------------------------------------------------

    if (!refreshToken) {
      clearSellerSession();

      window.location.replace("/login");

      return Promise.reject(error);
    }

    // ------------------------------------------------------
    // Another request is already refreshing
    // ------------------------------------------------------

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization =
            `Bearer ${newToken}`;

          resolve(api(originalRequest));
        });
      });
    }

    // ------------------------------------------------------
    // Start refresh
    // ------------------------------------------------------

    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(
        `${API_URL}/token/refresh/`,
        {
          refresh: refreshToken,
        }
      );

      const newAccessToken =
        refreshResponse.data.access;

      if (!newAccessToken) {
        throw new Error(
          "New access token was not returned."
        );
      }

      // ----------------------------------------------------
      // Save new access token
      // ----------------------------------------------------

      localStorage.setItem(
        "sellerAccessToken",
        newAccessToken
      );

      // ----------------------------------------------------
      // Save rotated refresh token if returned
      // ----------------------------------------------------

      if (refreshResponse.data.refresh) {
        localStorage.setItem(
          "sellerRefreshToken",
          refreshResponse.data.refresh
        );
      }

      // ----------------------------------------------------
      // Release queued requests
      // ----------------------------------------------------

      onRefreshed(newAccessToken);

      // ----------------------------------------------------
      // Retry original request
      // ----------------------------------------------------

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);

    } catch (refreshError) {
      clearSellerSession();

      refreshSubscribers = [];

      window.location.replace("/login");

      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;