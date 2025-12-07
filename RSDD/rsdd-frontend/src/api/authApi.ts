import axios, { AxiosError } from "axios";
import { api } from "./axios";
import { getAccessToken, refreshAccessToken, setTokens } from "./authService";

// create an axios instance for authenticated requests
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// add access token before request
authApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// response interceptor to try refresh on 401 once, then retry
authApi.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;

    // if 401 and we haven't retried yet, try refreshing
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccess = await refreshAccessToken();
        // set new header and retry
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return authApi(originalRequest);
      } catch (e) {
        // refresh failed -> allow caller to handle (e.g. redirect to login)
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);
