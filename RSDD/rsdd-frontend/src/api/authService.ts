import { api } from "./axios";
import type { LoginResponse, User } from "../types";

const ACCESS_KEY = "rsdd_access_token";
const REFRESH_KEY = "rsdd_refresh_token";
const USER_KEY = "rsdd_user";

export function setTokens(access?: string | null, refresh?: string | null) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  else localStorage.removeItem(ACCESS_KEY);

  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  else localStorage.removeItem(REFRESH_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setUser(user: User | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function loginRequest(username: string, password: string) {
  const res = await api.post("/auth/login", { username, password });
  if (res.data.success) {
    const payload = res.data.data as LoginResponse;
    setTokens(payload.access_token, payload.refresh_token);
    setUser(payload.user);
    return payload.user;
  }
  throw new Error(res.data.error || "Login failed");
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await api.post(
    "/auth/refresh",
    {},
    { headers: { Authorization: `Bearer ${refreshToken}` } }
  );
  if (res.data.success) {
    const data = res.data.data as { access_token: string };
    setTokens(data.access_token, refreshToken);
    return data.access_token;
  }
  throw new Error("Failed to refresh token");
}
