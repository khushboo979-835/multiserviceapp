import axios from "axios";

// Production Render backend API URL for Inisha City Service
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://multiserviceapp-4pdw.onrender.com/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s timeout for Render cold-start resilience
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: attach admin JWT token and origin headers
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

// Response interceptor with automatic single-retry for cold starts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Handle 401 unauthenticated
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        window.location.href = "/";
      }
      return Promise.reject(error);
    }

    // Auto-retry once on timeout or network cold-start error
    if (config && !config._retry && (error.code === "ECONNABORTED" || !error.response || error.response.status >= 500)) {
      config._retry = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return await axios(config);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
