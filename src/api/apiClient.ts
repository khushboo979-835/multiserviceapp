import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// EXPO_PUBLIC_API_URL is automatically loaded by Expo in SDK 49+ from .env
const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://multiserviceapp-4pdw.onrender.com/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 45000, // 45s timeout for Render cold-start resilience
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (e.g. 401 unauthorized token clear) & auto-retry on cold start
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized API request - clearing auth session");
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    // Auto-retry once on Render cold-start timeout or 502/503/504
    if (
      config &&
      !config._retry &&
      (error.code === "ECONNABORTED" || !error.response || (error.response && error.response.status >= 500))
    ) {
      config._retry = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return await apiClient(config);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);
