import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor: Her isteğe Authorization header'ı ekle
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: 401 durumunda token yenile veya logout
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh_token = useAuthStore.getState().refresh_token;
      if (refresh_token) {
        try {
          const res = await axios.post(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
            }/auth/refresh`,
            { refresh_token }
          );
          const { access_token } = res.data;
          useAuthStore.getState().setAuth(
            useAuthStore.getState().user!,
            access_token,
            refresh_token
          );
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch {
          useAuthStore.getState().clearAuth();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
