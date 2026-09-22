import axios from "axios";

// Production Render backend API URL for Inisha City Service
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://multiserviceapp-4pdw.onrender.com/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (can attach admin token if session manager exists)
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);
